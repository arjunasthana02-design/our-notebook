import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {

    const navigate = useNavigate();

    return (

        <div className="home">

            <div className="homeWrapper">

                <img
                    src="/images/home/homepage.png"
                    className="homeImage"
                    alt="Notebook Cover"
                />

                {/* Open Notebook */}
                <motion.div
                    className="welcomeArea"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate("/welcome")}
                />

                {/* Bucket List */}
                <motion.div
                    className="bucketArea"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate("/planner")}
                />

                {/* Memories */}
                <motion.div
                    className="memoryArea"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate("/chapters")}
                />

            </div>

            <div
                style={{
                    textAlign: "center",
                    marginTop: "30px",
                    marginBottom: "40px"
                }}
            >

                <h2
                    style={{
                        fontFamily: "Georgia, serif",
                        color: "#5b3a29",
                        fontSize: "34px",
                        marginBottom: "12px"
                    }}
                >
                    📖 Open the Notebook
                </h2>

                <p
                    style={{
                        fontFamily: "Georgia, serif",
                        fontSize: "20px",
                        color: "#735746",
                        fontStyle: "italic",
                        lineHeight: "1.8"
                    }}
                >
                    Every letter has its own page.
                    <br />
                    Click to find out.
                </p>

            </div>

        </div>

    );

}