CREATE DATABASE IF NOT EXISTS notebook;
USE notebook;

CREATE TABLE IF NOT EXISTS meetup_planner
(
    meetup_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    location VARCHAR(255),
    target_date VARCHAR(255),
    category VARCHAR(100),
    priority VARCHAR(100),
    status VARCHAR(100),
    favourite BOOLEAN DEFAULT FALSE,
    completed BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS chapters
(
    chapter_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    summary TEXT,
    location VARCHAR(255),
    chapter_date VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    arjun_mood VARCHAR(255),
    arjun_story TEXT,
    arjun_favourite VARCHAR(255),
    bhoomi_mood VARCHAR(255),
    bhoomi_story TEXT,
    bhoomi_favourite VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS photos
(
    photo_id INT AUTO_INCREMENT PRIMARY KEY,
    chapter_id INT,
    photo_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS videos
(
    video_id INT AUTO_INCREMENT PRIMARY KEY,
    chapter_id INT,
    video_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS timeline
(
    timeline_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    chapter_order INT NOT NULL,
    is_loading BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS secrets
(
    secret_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    letter TEXT NOT NULL,
    password VARCHAR(255) NOT NULL,
    unlock_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS open_when_notes
(
    note_id VARCHAR(100) PRIMARY KEY,
    note_text TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO chapters
(
    title,
    summary,
    location,
    chapter_date,
    arjun_mood,
    arjun_story,
    arjun_favourite,
    bhoomi_mood,
    bhoomi_story,
    bhoomi_favourite
)
SELECT
    'Our First Meeting',
    'Finally meeting for the first time after ages',
    'DLF, Sec-18, Teashop, Arun Vihar,BP Market, Sec 46 Market.',
    '26 June 2026',
    'Nervous ,Happy ,Peaceful',
    'So firstly She has been ignoring the shit out of me for 3 years and when we finally meet WTF WHY IS SHE SO PRETTY SHE LITERALLY MADE ME NERVOUS like I remember i saw her once during our internship meeting there she looked really nice also first time I saw her in school i mean obviously she was pretty back then too thats why i followed her in the first place also on her insta too she looks beautiful BUT SAAMNE SE ITNA ACHA KON LAGTA HAI??????  it was probably the most peaceful i have ever found myself her talking non stop for some reasons gave me immense pleasure and happiness and for the first time i was  not using my phone while being in someone''s company or should i say for the first time I felt like I am free to feel emotions. I mean I told her about my father first meeting pe I havent told it to many of my close friends. First day was so good so much walking so much talking although i was late kinda still feel bad about it or else we would have got 1 more hour and then second day when our plan of gaming got cancelled we walked till 46 ka market and had coffee and the kids forcing her for the interview I found her to be very adorable at that moment but the best part was her trying to make me laugh watching those reels like wtf why is she laughing at literally everything and why is her laughs making me so happy probably because how pure her laughs were or because it was new for me, genuinely laughing with someone. Cant wait to be back in Noida. Already trying to find excuses',
    'Sitting near the fountain talking',
    '',
    '',
    ''
WHERE NOT EXISTS (SELECT 1 FROM chapters);

UPDATE chapters
SET
    title='Our First Meeting',
    summary='Finally meeting for the first time after ages',
    location='DLF, Sec-18, Teashop, Arun Vihar,BP Market, Sec 46 Market.',
    chapter_date='26 June 2026'
WHERE title IN ('Our saved memory', 'First Meeting', 'Our First Meeting');

INSERT INTO photos (chapter_id, photo_path)
SELECT chapter_id, '/uploads/photos/b9cee5b0-1820-4125-b2f6-18b238a37698_WhatsApp_Image_2026-07-02_at_12.20.37_AM.jpeg'
FROM chapters
WHERE title='Our First Meeting'
AND NOT EXISTS (SELECT 1 FROM photos);

INSERT INTO videos (chapter_id, video_path)
SELECT chapter_id, '/uploads/videos/4f7f1303-fe75-43a6-a9e5-e5be875d3a7e_WhatsApp_Video_2026-07-02_at_1.50.11_PM.mp4'
FROM chapters
WHERE title='Our First Meeting'
AND NOT EXISTS (
    SELECT 1
    FROM videos
    WHERE video_path='/uploads/videos/4f7f1303-fe75-43a6-a9e5-e5be875d3a7e_WhatsApp_Video_2026-07-02_at_1.50.11_PM.mp4'
);

INSERT INTO videos (chapter_id, video_path)
SELECT chapter_id, '/uploads/videos/cd33a5d0-8da8-454e-982c-104f416bd30b_WhatsApp_Video_2026-07-02_at_12.12.46_AM.mp4'
FROM chapters
WHERE title='Our First Meeting'
AND NOT EXISTS (
    SELECT 1
    FROM videos
    WHERE video_path='/uploads/videos/cd33a5d0-8da8-454e-982c-104f416bd30b_WhatsApp_Video_2026-07-02_at_12.12.46_AM.mp4'
);

INSERT INTO timeline (title, subtitle, chapter_order, is_loading)
SELECT 'First Time Seeing', '30 july 2022 you were wearing a white tshirt black pajamas and purple headband and I am pretty certain. .', 1, FALSE
WHERE NOT EXISTS (SELECT 1 FROM timeline);

INSERT INTO timeline (title, subtitle, chapter_order, is_loading)
SELECT 'First Conversation', '15 April 2023 I texted hi finally took me ages though but I did.', 2, FALSE
WHERE NOT EXISTS (SELECT 1 FROM timeline WHERE title='First Conversation');

INSERT INTO timeline (title, subtitle, chapter_order, is_loading)
SELECT 'First Rejection', '26 Jan 2026 you rejected me without even me asking you out and called me brother.... fucking hated you for it but yeah i dont blame you you had a boyfriend.', 3, FALSE
WHERE NOT EXISTS (SELECT 1 FROM timeline WHERE title='First Rejection');

INSERT INTO timeline (title, subtitle, chapter_order, is_loading)
SELECT 'First Meeting', 'Finally, a page worth waiting for.26 June 2026 ig I dont have to mention anything about it it was perfect', 4, FALSE
WHERE NOT EXISTS (SELECT 1 FROM timeline WHERE title='First Meeting');

INSERT INTO timeline (title, subtitle, chapter_order, is_loading)
SELECT 'Loading...', 'Reserved for our next first.', 5, TRUE
WHERE NOT EXISTS (SELECT 1 FROM timeline WHERE is_loading=TRUE);

INSERT INTO secrets (title, letter, password, unlock_date)
SELECT
    'Open when the time is right',
    'Write this one yourself when the moment finally makes sense.',
    '260626',
    NULL
WHERE NOT EXISTS (SELECT 1 FROM secrets);

INSERT INTO meetup_planner
(
    title,
    description,
    location,
    target_date,
    category,
    priority,
    status,
    favourite,
    completed
)
SELECT
    'Visit Mumbai',
    'A 3-4 day trip to Mumbai ',
    '',
    '',
    'Travel',
    'Dream Goal',
    'Planning',
    FALSE,
    FALSE
WHERE NOT EXISTS (SELECT 1 FROM meetup_planner WHERE title='Visit Mumbai');

INSERT INTO meetup_planner
(
    title,
    description,
    location,
    target_date,
    category,
    priority,
    status,
    favourite,
    completed
)
SELECT
    'MKT Trip',
    'Trying MKT''s Food',
    '',
    'soon',
    'Food',
    'High',
    'Not Started',
    FALSE,
    FALSE
WHERE NOT EXISTS (SELECT 1 FROM meetup_planner WHERE title='MKT Trip');

DELETE FROM meetup_planner
WHERE title='Make a new bucket-list memory'
AND description='Add the dreams here as they come back to us.';
