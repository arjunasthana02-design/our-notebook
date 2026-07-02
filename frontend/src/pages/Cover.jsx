import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Cover.css";

export default function Cover() {

  const navigate = useNavigate();

  const [opening, setOpening] = useState(false);

  const openNotebook = () => {

    if (opening) return;

    setOpening(true);

    setTimeout(() => {

      navigate("/welcome");

    }, 1200);

  };

  return (

    <div className="cover-page">

      <AnimatePresence>

        {!opening && (

          <motion.img
            src="/images/cover/coverpage.png"
            className="cover-image"
            alt="Notebook cover"
            initial={{ opacity:0 }}
            animate={{ opacity:1 }}
            exit={{
              scale:2.2,
              rotate:-7,
              opacity:0,
              transition:{
                duration:1.15,
                ease:"easeInOut"
              }
            }}
          />

        )}

      </AnimatePresence>

      <motion.div

        className="click-area"

        whileHover={{
          scale:1.03
        }}

        whileTap={{
          scale:.98
        }}

        animate={opening ? {

          scale:2.2,

          rotate:-7,

          opacity:0

        } : {}}

        transition={{
          duration:1.1,
          ease:"easeInOut"
        }}

        onClick={openNotebook}

      />

      {!opening && (

        <motion.div

          className="click-text"

          animate={{
            y:[0,-7,0]
          }}

          transition={{
            repeat:Infinity,
            duration:2
          }}

        >

          Open the notebook to begin



        </motion.div>

      )}

    </div>

  );

}
