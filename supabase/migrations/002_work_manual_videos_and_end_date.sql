-- 작품 페이지: 수동 유튜브 영상 ID 목록, 시리즈 종료일
ALTER TABLE works
  ADD COLUMN IF NOT EXISTS manual_video_ids text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS end_date date;

COMMENT ON COLUMN works.manual_video_ids IS '관리자가 직접 등록한 유튜브 영상 ID 목록 (작품 상세 영상 섹션 상단 노출)';
COMMENT ON COLUMN works.end_date IS '시리즈 종료일 (미정이면 null)';
