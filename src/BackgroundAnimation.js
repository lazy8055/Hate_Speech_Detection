import React, { useEffect } from "react";
import "./BackgroundAnimation.css";

const BackgroundAnimation = () => {
  useEffect(() => {
    const loadScripts = () => {
      const scriptJQuery = document.createElement("script");
      scriptJQuery.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js";
      scriptJQuery.async = true;
      document.body.appendChild(scriptJQuery);

      scriptJQuery.onload = () => {
        const scriptBg = document.createElement("script");
        scriptBg.src = "./script.js";
        scriptBg.async = true;
        document.body.appendChild(scriptBg);
      };

      return () => {
        document.body.removeChild(scriptJQuery);
        const scriptBg = document.querySelector('script[src="./script.js"]');
        if (scriptBg) {
          document.body.removeChild(scriptBg);
        }
      };
    };

    loadScripts();

    return loadScripts();
  }, []);

  return (
    <div id="bg">
      <canvas></canvas>
      <canvas></canvas>
      <canvas></canvas>
    </div>
  );
};

export default BackgroundAnimation;
