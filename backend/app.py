import os
import uuid
from datetime import date, datetime
from urllib.parse import unquote, urlparse


from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_mysqldb import MySQL
from werkzeug.utils import secure_filename

app = Flask(__name__)


@app.errorhandler(Exception)
def handle_unexpected_error(error):

    return jsonify({
        "success": False,
        "error": str(error)
    }), 500

# ==========================================
# CORS
# ==========================================

CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"]
)


@app.before_request
def handle_preflight():

    if request.method == "OPTIONS":
        return "", 204

# ==========================================
# MYSQL CONFIG
# ==========================================

def first_env(*names, default=None):

    for name in names:

        value = os.getenv(name)

        if value not in (None, ""):
            return value.strip()

    return default


def normalize_mysql_host(host):

    if host == "ayabusa.proxy.rlwy.net":
        return "hayabusa.proxy.rlwy.net"

    return host


def mysql_config_from_env():

    database_url = first_env(
        "MYSQL_URL",
        "MYSQL_PUBLIC_URL",
        "DATABASE_URL"
    )

    config = {}

    if database_url:

        parsed_url = urlparse(database_url)

        if parsed_url.scheme.startswith("mysql"):

            config.update({
                "MYSQL_HOST": normalize_mysql_host(parsed_url.hostname),
                "MYSQL_USER": unquote(parsed_url.username or ""),
                "MYSQL_PASSWORD": unquote(parsed_url.password or ""),
                "MYSQL_DB": unquote(parsed_url.path.lstrip("/")),
                "MYSQL_PORT": parsed_url.port or 3306
            })

            return config

    config.update({
        "MYSQL_HOST": normalize_mysql_host(
            first_env(
                "MYSQLHOST",
                "MYSQL_HOST",
                "DB_HOST",
                "DATABASE_HOST"
            )
        ),
        "MYSQL_USER": first_env(
            "MYSQLUSER",
            "MYSQL_USER",
            "DB_USER",
            "DATABASE_USER"
        ),
        "MYSQL_PASSWORD": first_env(
            "MYSQLPASSWORD",
            "MYSQL_PASSWORD",
            "DB_PASSWORD",
            "DATABASE_PASSWORD"
        ),
        "MYSQL_DB": first_env(
            "MYSQLDATABASE",
            "MYSQL_DATABASE",
            "MYSQL_DB",
            "DB_NAME",
            "DATABASE_NAME"
        ),
        "MYSQL_PORT": int(first_env(
            "MYSQLPORT",
            "MYSQL_PORT",
            "DB_PORT",
            "DATABASE_PORT",
            default="3306"
        ))
    })

    if not config["MYSQL_HOST"] and os.getenv("RENDER") != "true":

        config.update({
            "MYSQL_HOST": "localhost",
            "MYSQL_USER": "root",
            "MYSQL_PASSWORD": "Arjun@0901",
            "MYSQL_DB": "notebook",
            "MYSQL_PORT": 3306
        })

    return config


app.config.update(mysql_config_from_env())

mysql = MySQL(app)


schema_ready = False

SCHEMA_STATEMENTS = [
    """
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
    )
    """,
    """
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
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS photos
    (
        photo_id INT AUTO_INCREMENT PRIMARY KEY,
        chapter_id INT,
        photo_path TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS videos
    (
        video_id INT AUTO_INCREMENT PRIMARY KEY,
        chapter_id INT,
        video_path TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS timeline
    (
        timeline_id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        chapter_order INT NOT NULL,
        is_loading BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS secrets
    (
        secret_id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        letter TEXT NOT NULL,
        password VARCHAR(255) NOT NULL,
        unlock_date DATE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """
]

DEFAULT_TIMELINE = [
    ("First Time Seeing", "The first page where everything quietly began.", 1, False),
    ("First Conversation", "A small hello that became part of our story.", 2, False),
    ("First Rejection", "Even the almosts deserve a page.", 3, False),
    ("First Meeting", "The day distance turned into a real moment.", 4, False),
    ("Loading...", "Some chapters are still waiting to happen.", 5, True),
]

DEFAULT_SECRETS = [
    (
        "Open when the time is right",
        "Write this one yourself when the moment finally makes sense.",
        "260626",
        None,
    ),
]


def ensure_database_schema():

    global schema_ready

    if schema_ready:
        return

    cur = mysql.connection.cursor()

    for statement in SCHEMA_STATEMENTS:
        cur.execute(statement)

    ensure_column(cur, "timeline", "subtitle", "TEXT")
    ensure_column(cur, "timeline", "chapter_order", "INT NOT NULL DEFAULT 1")
    ensure_column(cur, "timeline", "is_loading", "BOOLEAN DEFAULT FALSE")
    ensure_column(cur, "secrets", "unlock_date", "DATE NULL")

    cur.execute("SELECT COUNT(*) FROM timeline")
    if cur.fetchone()[0] == 0:
        cur.executemany(
            """
            INSERT INTO timeline (title, subtitle, chapter_order, is_loading)
            VALUES (%s,%s,%s,%s)
            """,
            DEFAULT_TIMELINE
        )
    else:
        cur.execute("""
            UPDATE timeline
            SET is_loading=TRUE, title='Loading...'
            WHERE title='Loading...'
        """)
        cur.execute("SELECT COUNT(*) FROM timeline WHERE is_loading=TRUE")
        if cur.fetchone()[0] == 0:
            cur.execute("""
                INSERT INTO timeline (title, subtitle, chapter_order, is_loading)
                VALUES ('Loading...', 'Some chapters are still waiting to happen.', 9999, TRUE)
            """)

    cur.execute("""
        SELECT COALESCE(MAX(chapter_order), 0)
        FROM timeline
        WHERE is_loading=FALSE
    """)
    last_timeline_order = cur.fetchone()[0] or 0
    cur.execute("""
        UPDATE timeline
        SET chapter_order=%s
        WHERE is_loading=TRUE
    """, (last_timeline_order + 1,))

    cur.execute("SELECT COUNT(*) FROM secrets")
    if cur.fetchone()[0] == 0:
        cur.executemany(
            """
            INSERT INTO secrets (title, letter, password, unlock_date)
            VALUES (%s,%s,%s,%s)
            """,
            DEFAULT_SECRETS
        )

    mysql.connection.commit()
    cur.close()
    schema_ready = True


def ensure_column(cur, table_name, column_name, column_definition):

    cur.execute(f"SHOW COLUMNS FROM {table_name} LIKE %s", (column_name,))

    if cur.fetchone():
        return

    cur.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_definition}")


def db_cursor():

    ensure_database_schema()
    return mysql.connection.cursor()


def mysql_config_status():

    required_keys = [
        "MYSQL_HOST",
        "MYSQL_USER",
        "MYSQL_PASSWORD",
        "MYSQL_DB",
        "MYSQL_PORT"
    ]

    return {
        "host": app.config.get("MYSQL_HOST"),
        "user": app.config.get("MYSQL_USER"),
        "database": app.config.get("MYSQL_DB"),
        "port": app.config.get("MYSQL_PORT"),
        "password_set": bool(app.config.get("MYSQL_PASSWORD")),
        "missing": [
            key
            for key in required_keys
            if app.config.get(key) in (None, "")
        ],
        "env_present": {
            "MYSQLHOST": bool(os.getenv("MYSQLHOST")),
            "MYSQL_HOST": bool(os.getenv("MYSQL_HOST")),
            "MYSQLUSER": bool(os.getenv("MYSQLUSER")),
            "MYSQL_USER": bool(os.getenv("MYSQL_USER")),
            "MYSQLPASSWORD": bool(os.getenv("MYSQLPASSWORD")),
            "MYSQL_PASSWORD": bool(os.getenv("MYSQL_PASSWORD")),
            "MYSQLDATABASE": bool(os.getenv("MYSQLDATABASE")),
            "MYSQL_DATABASE": bool(os.getenv("MYSQL_DATABASE")),
            "MYSQL_DB": bool(os.getenv("MYSQL_DB")),
            "MYSQLPORT": bool(os.getenv("MYSQLPORT")),
            "MYSQL_PORT": bool(os.getenv("MYSQL_PORT")),
            "MYSQL_URL": bool(os.getenv("MYSQL_URL")),
            "MYSQL_PUBLIC_URL": bool(os.getenv("MYSQL_PUBLIC_URL")),
            "DATABASE_URL": bool(os.getenv("DATABASE_URL"))
        }
    }

# ==========================================
# UPLOAD FOLDERS
# ==========================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", os.path.join(BASE_DIR, "uploads"))
PROJECT_UPLOAD_FOLDER = os.path.abspath(os.path.join(BASE_DIR, "..", "uploads"))

PHOTO_FOLDER = os.path.join(UPLOAD_FOLDER, "photos")
VIDEO_FOLDER = os.path.join(UPLOAD_FOLDER, "videos")
PROJECT_PHOTO_FOLDER = os.path.join(PROJECT_UPLOAD_FOLDER, "photos")
PROJECT_VIDEO_FOLDER = os.path.join(PROJECT_UPLOAD_FOLDER, "videos")

os.makedirs(PHOTO_FOLDER, exist_ok=True)
os.makedirs(VIDEO_FOLDER, exist_ok=True)

app.config["PHOTO_FOLDER"] = PHOTO_FOLDER
app.config["VIDEO_FOLDER"] = VIDEO_FOLDER


def find_uploaded_filename(folder_paths, filename):

    filename = secure_filename(filename)

    for folder_path in folder_paths:

        exact_path = os.path.join(folder_path, filename)

        if os.path.exists(exact_path):
            return folder_path, filename

    suffix = f"_{filename}"

    for folder_path in folder_paths:

        if not os.path.isdir(folder_path):
            continue

        for existing_filename in os.listdir(folder_path):

            if (
                existing_filename == filename or
                filename.endswith(f"_{existing_filename}") or
                existing_filename.endswith(suffix)
            ):
                return folder_path, existing_filename

    return None, None

# ==========================================
# HOME
# ==========================================

@app.route("/")
def home():

    return jsonify({
        "message": "Notebook Backend Running ❤️"
    })

# ==========================================
# LOGIN
# ==========================================

@app.route("/login", methods=["POST", "OPTIONS"])
def login():

    if request.method == "OPTIONS":
        return "", 204

    data = request.get_json(silent=True) or {}

    password = data.get("password")

    if password == "Bhoomi0903":

        return jsonify({
            "success": True
        })

    return jsonify({
        "success": False
    }), 401
# ==========================================
# TEST DATABASE
# ==========================================

@app.route("/test-db")
def test_db():

    try:

        config_status = mysql_config_status()

        if config_status["missing"]:

            return jsonify({
                "connected": False,
                "error": "Missing MySQL configuration",
                "mysql_config": config_status
            }), 500

        cur = db_cursor()

        cur.execute("SELECT DATABASE();")

        db = cur.fetchone()

        cur.close()

        return jsonify({
            "connected": True,
            "database": db[0],
            "mysql_config": config_status
        })

    except Exception as e:

        return jsonify({
            "connected": False,
            "error": str(e),
            "mysql_config": mysql_config_status()
        })

# ==========================================
# SERVE UPLOADED FILES
# ==========================================

@app.route("/uploads/<folder>/<filename>")
def uploaded_file(folder, filename):

    if folder == "photos":
        folder_path, served_filename = find_uploaded_filename(
            [app.config["PHOTO_FOLDER"], PROJECT_PHOTO_FOLDER],
            filename
        )

        if not served_filename:
            return "File not found", 404

        return send_from_directory(folder_path, served_filename)

    if folder == "videos":
        folder_path, served_filename = find_uploaded_filename(
            [app.config["VIDEO_FOLDER"], PROJECT_VIDEO_FOLDER],
            filename
        )

        if not served_filename:
            return "File not found", 404

        return send_from_directory(folder_path, served_filename)

    return "Folder not found", 404

# ==========================================
# PHOTO UPLOAD
# ==========================================

@app.route("/upload-photo/<int:chapter_id>", methods=["POST"])
def upload_photo(chapter_id):

    if "photo" not in request.files:
        return jsonify({
            "error": "No photo uploaded"
        }), 400

    photo = request.files["photo"]

    filename = (
        f"{uuid.uuid4()}_"
        f"{secure_filename(photo.filename)}"
    )

    save_path = os.path.join(
        app.config["PHOTO_FOLDER"],
        filename
    )

    photo.save(save_path)

    photo_path = f"/uploads/photos/{filename}"

    cur = db_cursor()

    cur.execute(
        """
        INSERT INTO photos
        (
            chapter_id,
            photo_path
        )
        VALUES
        (%s,%s)
        """,
        (
            chapter_id,
            photo_path
        )
    )

    mysql.connection.commit()

    cur.close()

    return jsonify({
        "success": True,
        "photo": photo_path
    })

# ==========================================
# VIDEO UPLOAD
# ==========================================

@app.route("/upload-video/<int:chapter_id>", methods=["POST"])
def upload_video(chapter_id):

    if "video" not in request.files:
        return jsonify({
            "error": "No video uploaded"
        }), 400

    video = request.files["video"]

    filename = (
        f"{uuid.uuid4()}_"
        f"{secure_filename(video.filename)}"
    )

    save_path = os.path.join(
        app.config["VIDEO_FOLDER"],
        filename
    )

    video.save(save_path)

    video_path = f"/uploads/videos/{filename}"

    cur = db_cursor()

    cur.execute(
        """
        INSERT INTO videos
        (
            chapter_id,
            video_path
        )
        VALUES
        (%s,%s)
        """,
        (
            chapter_id,
            video_path
        )
    )

    mysql.connection.commit()

    cur.close()

    return jsonify({
        "success": True,
        "video": video_path
    })

# ==========================================
# PLANNER API
# ==========================================
# ==========================================
# PLANNER API
# ==========================================

# -------------------------
# GET ALL DREAMS
# -------------------------

@app.route("/planner", methods=["GET"])
def get_planner():

    cur = db_cursor()

    cur.execute("""

        SELECT

            meetup_id,
            title,
            description,
            location,
            target_date,
            category,
            priority,
            status,
            favourite,
            completed

        FROM meetup_planner

        ORDER BY meetup_id DESC

    """)

    rows = cur.fetchall()

    cur.close()

    dreams = []

    for row in rows:

        dreams.append({

            "id": row[0],
            "title": row[1],
            "description": row[2],
            "location": row[3],
            "target_date": str(row[4]) if row[4] else "",
            "category": row[5],
            "priority": row[6],
            "status": row[7],
            "favourite": bool(row[8]),
            "completed": bool(row[9])

        })

    return jsonify(dreams)


# -------------------------
# ADD DREAM
# -------------------------

@app.route("/planner", methods=["POST"])
def add_planner():

    data = request.get_json()
    print("========== DATA ==========")
    print(data)
    print("==========================")

    cur = db_cursor()

    cur.execute("""

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

        VALUES
        (%s,%s,%s,%s,%s,%s,%s,%s,%s)

    """, (

        data.get("title"),
        data.get("description"),
        data.get("location"),
        data.get("target_date") or None,
        data.get("category"),
        data.get("priority"),
        data.get("status"),
        data.get("favourite", False),
        False

    ))

    mysql.connection.commit()

    cur.close()

    return jsonify({

        "success": True,
        "message": "Dream Saved"

    })


# -------------------------
# UPDATE DREAM
# -------------------------

@app.route("/planner/<int:id>", methods=["PUT"])
def update_planner(id):

    data = request.get_json()
    print("========== DATA ==========")
    print(data)
    print("==========================")

    cur = db_cursor()

    cur.execute("""

        UPDATE meetup_planner

        SET

            title=%s,
            description=%s,
            location=%s,
            target_date=%s,
            category=%s,
            priority=%s,
            status=%s,
            favourite=%s,
            completed=%s

        WHERE meetup_id=%s

    """, (

        data.get("title"),
        data.get("description"),
        data.get("location"),
        data.get("target_date") or None,
        data.get("category"),
        data.get("priority"),
        data.get("status"),
        data.get("favourite"),
        data.get("completed"),
        id

    ))

    mysql.connection.commit()

    cur.close()

    return jsonify({

        "success": True,
        "message": "Dream Updated"

    })


# -------------------------
# DELETE DREAM
# -------------------------

@app.route("/planner/<int:id>", methods=["DELETE"])
def delete_planner(id):

    cur = db_cursor()

    cur.execute(

        "DELETE FROM meetup_planner WHERE meetup_id=%s",

        (id,)

    )

    mysql.connection.commit()

    cur.close()

    return jsonify({

        "success": True,
        "message": "Dream Deleted"

    })


# ==========================================
# MEMORIES API
# ==========================================
# ==========================================
# MEMORIES API
# ==========================================

CHAPTER_COLUMNS = """
    chapter_id,
    title,
    summary,
    location,
    chapter_date,
    created_at,
    arjun_mood,
    arjun_story,
    arjun_favourite,
    bhoomi_mood,
    bhoomi_story,
    bhoomi_favourite
"""


def get_media_for_chapters(chapter_ids):

    if not chapter_ids:
        return {}

    placeholders = ",".join(["%s"] * len(chapter_ids))

    media = {
        chapter_id: {
            "photos": [],
            "videos": []
        }
        for chapter_id in chapter_ids
    }

    cur = db_cursor()

    cur.execute(
        f"""
        SELECT chapter_id, photo_path
        FROM photos
        WHERE chapter_id IN ({placeholders})
        ORDER BY photo_id ASC
        """,
        tuple(chapter_ids)
    )

    for chapter_id, photo_path in cur.fetchall():
        media.setdefault(chapter_id, {"photos": [], "videos": []})
        media[chapter_id]["photos"].append(photo_path)

    cur.execute(
        f"""
        SELECT chapter_id, video_path
        FROM videos
        WHERE chapter_id IN ({placeholders})
        ORDER BY video_id ASC
        """,
        tuple(chapter_ids)
    )

    for chapter_id, video_path in cur.fetchall():
        media.setdefault(chapter_id, {"photos": [], "videos": []})
        media[chapter_id]["videos"].append(video_path)

    cur.close()

    return media


def chapter_to_dict(row, media=None):

    chapter_id = row[0]
    media = media or {}
    chapter_media = media.get(chapter_id, {})

    return {

        "id": chapter_id,
        "title": row[1],
        "summary": row[2],
        "location": row[3],
        "chapter_date": str(row[4]) if row[4] else "",
        "created_at": str(row[5]) if row[5] else "",

        "arjun_mood": row[6],
        "arjun_story": row[7],
        "arjun_favourite": row[8],

        "bhoomi_mood": row[9],
        "bhoomi_story": row[10],
        "bhoomi_favourite": row[11],

        "photos": chapter_media.get("photos", []),
        "videos": chapter_media.get("videos", [])

    }

# -------------------------
# GET ALL MEMORIES
# -------------------------

@app.route("/chapters", methods=["GET"])
def get_chapters():

    cur = db_cursor()

    cur.execute(f"""
        SELECT
            {CHAPTER_COLUMNS}
        FROM chapters
        ORDER BY chapter_id DESC
    """)

    rows = cur.fetchall()

    cur.close()

    media = get_media_for_chapters([row[0] for row in rows])
    memories = [chapter_to_dict(row, media) for row in rows]

    return jsonify(memories)


# -------------------------
# GET SINGLE MEMORY
# -------------------------

@app.route("/chapters/<int:id>", methods=["GET"])
def get_chapter(id):

    cur = db_cursor()

    cur.execute(f"""
        SELECT
            {CHAPTER_COLUMNS}
        FROM chapters
        WHERE chapter_id=%s
    """, (id,))

    row = cur.fetchone()

    cur.close()

    if not row:

        return jsonify({
            "error": "Memory not found"
        }),404

    media = get_media_for_chapters([id])

    return jsonify(chapter_to_dict(row, media))


# -------------------------
# ADD MEMORY
# -------------------------

@app.route("/chapters", methods=["POST"])
def add_chapter():

    data = request.get_json()

    cur = db_cursor()

    cur.execute("""

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

        VALUES
        (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)

    """, (

        data.get("title"),
        data.get("summary"),
        data.get("location"),

        data.get("chapter_date") or None,

        data.get("arjun_mood"),
        data.get("arjun_story"),
        data.get("arjun_favourite"),

        data.get("bhoomi_mood"),
        data.get("bhoomi_story"),
        data.get("bhoomi_favourite")

    ))

    mysql.connection.commit()

    chapter_id = cur.lastrowid

    cur.close()

    return jsonify({

        "success": True,
        "chapter_id": chapter_id

    })
# -------------------------
# UPDATE MEMORY
# -------------------------

@app.route("/chapters/<int:id>", methods=["PUT"])
def update_chapter(id):

    data = request.get_json()

    cur = db_cursor()

    cur.execute("""

        UPDATE chapters

        SET

            title=%s,
            summary=%s,
            location=%s,
            chapter_date=%s,

            arjun_mood=%s,
            arjun_story=%s,
            arjun_favourite=%s,

            bhoomi_mood=%s,
            bhoomi_story=%s,
            bhoomi_favourite=%s

        WHERE chapter_id=%s

    """, (

        data.get("title"),
        data.get("summary"),
        data.get("location"),

        data.get("chapter_date") or None,

        data.get("arjun_mood"),
        data.get("arjun_story"),
        data.get("arjun_favourite"),

        data.get("bhoomi_mood"),
        data.get("bhoomi_story"),
        data.get("bhoomi_favourite"),


        id

    ))

    mysql.connection.commit()

    cur.close()

    return jsonify({
        "success": True
    })


# -------------------------
# DELETE MEMORY
# -------------------------

@app.route("/chapters/<int:id>", methods=["DELETE"])
def delete_chapter(id):

    cur = db_cursor()

    cur.execute(

        "DELETE FROM photos WHERE chapter_id=%s",

        (id,)

    )

    cur.execute(

        "DELETE FROM videos WHERE chapter_id=%s",

        (id,)

    )

    cur.execute(

        "DELETE FROM chapters WHERE chapter_id=%s",

        (id,)

    )

    mysql.connection.commit()

    cur.close()

    return jsonify({

        "success": True,
        "message": "Memory Deleted"

    })


@app.route("/timeline", methods=["GET"])
def get_timeline():

    cur = db_cursor()

    cur.execute("""
        SELECT
            timeline_id,
            title,
            subtitle,
            chapter_order,
            is_loading
        FROM timeline
        ORDER BY is_loading ASC, chapter_order ASC, timeline_id ASC
    """)

    rows = cur.fetchall()

    cur.close()

    timeline = []

    for row in rows:

        timeline.append({

            "id": row[0],
            "title": row[1],
            "subtitle": row[2],
            "chapter_order": row[3],
            "is_loading": bool(row[4])

        })

    return jsonify(timeline)


def keep_loading_chapter_last():

    cur = db_cursor()

    cur.execute("""
        SELECT COALESCE(MAX(chapter_order), 0)
        FROM timeline
        WHERE is_loading=FALSE
    """)

    last_order = cur.fetchone()[0] or 0

    cur.execute("""
        UPDATE timeline
        SET title='Loading...', chapter_order=%s
        WHERE is_loading=TRUE
    """, (last_order + 1,))

    mysql.connection.commit()
    cur.close()


@app.route("/timeline", methods=["POST"])
def add_timeline_chapter():

    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    subtitle = (data.get("subtitle") or "").strip()
    chapter_order = int(data.get("chapter_order") or 1)

    if not title:
        return jsonify({"success": False, "error": "Title is required"}), 400

    cur = db_cursor()

    cur.execute(
        """
        INSERT INTO timeline (title, subtitle, chapter_order, is_loading)
        VALUES (%s,%s,%s,FALSE)
        """,
        (title, subtitle, chapter_order)
    )

    mysql.connection.commit()
    chapter_id = cur.lastrowid
    cur.close()

    keep_loading_chapter_last()

    return jsonify({"success": True, "id": chapter_id})


@app.route("/timeline/<int:id>", methods=["PUT"])
def update_timeline_chapter(id):

    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    subtitle = (data.get("subtitle") or "").strip()
    chapter_order = int(data.get("chapter_order") or 1)

    if not title:
        return jsonify({"success": False, "error": "Title is required"}), 400

    cur = db_cursor()

    cur.execute("SELECT is_loading FROM timeline WHERE timeline_id=%s", (id,))
    row = cur.fetchone()

    if not row:
        cur.close()
        return jsonify({"success": False, "error": "Chapter not found"}), 404

    if bool(row[0]):
        cur.close()
        return jsonify({"success": False, "error": "Loading chapter cannot be edited"}), 400

    cur.execute(
        """
        UPDATE timeline
        SET title=%s, subtitle=%s, chapter_order=%s
        WHERE timeline_id=%s
        """,
        (title, subtitle, chapter_order, id)
    )

    mysql.connection.commit()
    cur.close()

    keep_loading_chapter_last()

    return jsonify({"success": True})


@app.route("/timeline/<int:id>", methods=["DELETE"])
def delete_timeline_chapter(id):

    cur = db_cursor()

    cur.execute("SELECT is_loading FROM timeline WHERE timeline_id=%s", (id,))
    row = cur.fetchone()

    if not row:
        cur.close()
        return jsonify({"success": False, "error": "Chapter not found"}), 404

    if bool(row[0]):
        cur.close()
        return jsonify({"success": False, "error": "Loading chapter cannot be deleted"}), 400

    cur.execute("DELETE FROM timeline WHERE timeline_id=%s", (id,))
    mysql.connection.commit()
    cur.close()

    keep_loading_chapter_last()

    return jsonify({"success": True})


@app.route("/photo-wall", methods=["GET"])
def get_photo_wall():

    cur = db_cursor()
    cur.execute(f"""
        SELECT {CHAPTER_COLUMNS}
        FROM chapters
        ORDER BY chapter_id DESC
    """)
    rows = cur.fetchall()
    cur.close()

    media = get_media_for_chapters([row[0] for row in rows])
    return jsonify([chapter_to_dict(row, media) for row in rows])


@app.route("/secrets", methods=["GET"])
def get_secrets():

    cur = db_cursor()
    cur.execute("""
        SELECT MIN(secret_id), title, unlock_date
        FROM secrets
        GROUP BY title, unlock_date
        ORDER BY MIN(secret_id) ASC
    """)

    rows = cur.fetchall()
    cur.close()

    return jsonify([
        {
            "id": row[0],
            "title": row[1],
            "unlock_date": str(row[2]) if row[2] else None,
            "locked": True
        }
        for row in rows
    ])


@app.route("/secrets/all", methods=["GET"])
def get_all_secrets():

    cur = db_cursor()
    cur.execute("""
        SELECT secret_id, title, unlock_date
        FROM secrets
        ORDER BY secret_id ASC
    """)
    rows = cur.fetchall()
    cur.close()

    return jsonify([
        {
            "id": row[0],
            "title": row[1],
            "unlock_date": str(row[2]) if row[2] else None,
            "locked": True
        }
        for row in rows
    ])


@app.route("/secrets/<int:id>/unlock", methods=["POST"])
def unlock_secret(id):

    data = request.get_json(silent=True) or {}
    password = data.get("password") or ""

    cur = db_cursor()
    cur.execute(
        """
        SELECT title, letter, password, unlock_date
        FROM secrets
        WHERE secret_id=%s
        """,
        (id,)
    )
    row = cur.fetchone()
    cur.close()

    if not row:
        return jsonify({"success": False, "message": "Not the right time."}), 404

    unlock_date = row[3]
    if isinstance(unlock_date, datetime):
        unlock_date = unlock_date.date()

    if password != row[2] or (unlock_date and date.today() < unlock_date):
        return jsonify({"success": False, "message": "Not the right time."}), 403

    return jsonify({
        "success": True,
        "title": row[0],
        "letter": row[1]
    })


# ==========================================
# RUN APP
# ==========================================
if __name__ == "__main__":

    app.run(
        host=os.getenv("FLASK_HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 5000)),
        debug=os.getenv("FLASK_DEBUG", "0") == "1"
    )
