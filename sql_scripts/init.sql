CREATE TABLE IF NOT EXISTS users (
  user_id      INTEGER     PRIMARY KEY  AUTOINCREMENT,
  username     VARCHAR(20) NOT NULL,
  password     CHAR(64)    NOT NULL,
  registeredAt BIGINT
);
