CREATE KEYSPACE IF NOT EXISTS streamplatform
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

USE streamplatform;

CREATE TABLE IF NOT EXISTS chat_log (
    streamer_id int,
    ts timeuuid,
    message_id text,
    user_id int,
    username text,
    content text,
    PRIMARY KEY ((streamer_id), ts)
) WITH CLUSTERING ORDER BY (ts DESC);

CREATE TABLE IF NOT EXISTS user_channel_history (
    streamer_id int,
    user_id int,
    ts timeuuid,
    message_id text,
    username text,
    content text,
    PRIMARY KEY ((streamer_id, user_id), ts)
) WITH CLUSTERING ORDER BY (ts DESC);
