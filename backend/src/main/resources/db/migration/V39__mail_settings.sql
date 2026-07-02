CREATE TABLE mail_settings (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    host VARCHAR(255) NOT NULL DEFAULT 'smtp.gmail.com',
    port INTEGER NOT NULL DEFAULT 587 CHECK (port BETWEEN 1 AND 65535),
    username VARCHAR(255),
    password TEXT,
    from_address VARCHAR(255) NOT NULL DEFAULT 'noreply@fogistanbul.com',
    smtp_auth BOOLEAN NOT NULL DEFAULT TRUE,
    start_tls BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO mail_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;
