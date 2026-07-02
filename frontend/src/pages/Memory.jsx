import { Link, useParams } from "react-router-dom";
import ScrapbookLayout from "../components/ScrapbookLayout";
import { useEffect, useState } from "react";
import { API_BASE_URL, apiUrl } from "../services/api";

export default function Memory() {

  const { id } = useParams();

  const [memory, setMemory] = useState(null);

  const [loading, setLoading] = useState(true);

  const mediaUrl = (path) =>
    path?.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  useEffect(() => {

    loadMemory();

  }, [id]);

  async function loadMemory() {

    try {

      const res = await fetch(apiUrl(`/chapters/${id}`));

      const data = await res.json();

      setMemory(res.ok ? data : null);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }

  }

  if (loading) {

    return (

      <ScrapbookLayout>

        <section className="paper-stage">

          <h1>Loading...</h1>

        </section>

      </ScrapbookLayout>

    );

  }

  if (!memory) {

    return (

      <ScrapbookLayout>

        <section className="paper-stage">

          <h1>Memory not found.</h1>

          <Link to="/chapters">

            Back

          </Link>

        </section>

      </ScrapbookLayout>

    );

  }

  return (

    <ScrapbookLayout>

      <section className="paper-stage">

        <h1>{memory.title}</h1>

        <p>{memory.summary}</p>

        <br/>

        <strong>Location</strong>

        <p>{memory.location}</p>

        <br/>

        <strong>Chapter Date</strong>

        <p>{memory.chapter_date || "-"}</p>

        <br/>

        <strong>Bhoomi's Corner</strong>

        <p>Mood: {memory.bhoomi_mood || "-"}</p>

        <p>Favourite Moment: {memory.bhoomi_favourite || "-"}</p>

        <p>{memory.bhoomi_story || "-"}</p>

        <br/>

        <strong>Arjun's Corner</strong>

        <p>Mood: {memory.arjun_mood || "-"}</p>

        <p>Favourite Moment: {memory.arjun_favourite || "-"}</p>

        <p>{memory.arjun_story || "-"}</p>

        {memory.photos?.length > 0 && (

          <>

            <br/>

            <strong>Photos</strong>

            <div className="scrap-grid" style={{ marginTop: 15 }}>

              {memory.photos.map((photo) => (

                <img
                  key={photo}
                  src={mediaUrl(photo)}
                  alt=""
                  style={{
                    width: "100%",
                    borderRadius: 8
                  }}
                />

              ))}

            </div>

          </>

        )}

        {memory.videos?.length > 0 && (

          <>

            <br/>

            <strong>Videos</strong>

            <div className="scrap-grid" style={{ marginTop: 15 }}>

              {memory.videos.map((video) => (

                <video
                  key={video}
                  src={mediaUrl(video)}
                  controls
                  style={{
                    width: "100%",
                    borderRadius: 8
                  }}
                />

              ))}

            </div>

          </>

        )}

        <br/>

        <Link className="notebook-button" to="/chapters">

          Back

        </Link>

      </section>

    </ScrapbookLayout>

  );

}
