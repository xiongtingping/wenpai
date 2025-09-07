-- 添加 corpusType 字段到 user_brand_corpus 表
-- 修复：column user_brand_corpus.corpusType does not exist 错误

-- 添加 corpusType 字段，用于分类不同类型的品牌数据
ALTER TABLE user_brand_corpus 
ADD COLUMN IF NOT EXISTS corpus_type VARCHAR(50);

-- 添加 corpusName 字段
ALTER TABLE user_brand_corpus 
ADD COLUMN IF NOT EXISTS corpus_name VARCHAR(255);

-- 添加 corpusContent 字段  
ALTER TABLE user_brand_corpus 
ADD COLUMN IF NOT EXISTS corpus_content TEXT;

-- 为现有记录设置默认值
UPDATE user_brand_corpus 
SET corpus_type = 'brand_profile'
WHERE corpus_type IS NULL;

UPDATE user_brand_corpus 
SET corpus_name = brand_name
WHERE corpus_name IS NULL AND brand_name IS NOT NULL;

UPDATE user_brand_corpus 
SET corpus_content = JSON_BUILD_OBJECT(
    'brand_name', brand_name,
    'brand_description', brand_description,
    'tone_keywords', tone_keywords,
    'style_guide', style_guide,
    'content_samples', content_samples
)::TEXT
WHERE corpus_content IS NULL;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_brand_corpus_type ON user_brand_corpus(corpus_type);
CREATE INDEX IF NOT EXISTS idx_user_brand_corpus_name ON user_brand_corpus(corpus_name);

-- 添加约束确保数据一致性
ALTER TABLE user_brand_corpus 
ADD CONSTRAINT check_corpus_type 
CHECK (corpus_type IN ('brand_profile', 'brand_dimensions', 'user_content'));

COMMENT ON COLUMN user_brand_corpus.corpus_type IS '内容类型：brand_profile, brand_dimensions, user_content';
COMMENT ON COLUMN user_brand_corpus.corpus_name IS '内容名称';
COMMENT ON COLUMN user_brand_corpus.corpus_content IS '内容数据（JSON格式）';