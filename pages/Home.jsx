import { useEffect, useState } from "react";
import { saveAs } from 'file-saver';
import axios from 'axios';
const Home = () => {
  const [text, setText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [supportedLanguages, setSupportedLanguages] = useState([]);
  const [languageName, setLanguageName] = useState([]);
  // const audioRef = useRef(null);
  // const [synthesizedAudio, setSynthesizedAudio] = useState(null);

  useEffect(() => {
    const fetchSupportedLanguages = async () => {
      try {
        const response = await axios.get(
          'https://api.cognitive.microsofttranslator.com/languages?api-version=3.0',
          {
            headers: {
              'Ocp-Apim-Subscription-Key':`${import.meta.env.VITE_API_KEY}`,
              'Ocp-Apim-Subscription-Region': 'centralindia'
            }
          }
        );
        setSupportedLanguages(Object.keys(response.data.translation));
        setLanguageName(response.data.translation)
      } catch (error) {
        console.error(error);
      }
    };

    fetchSupportedLanguages();
    
  }, []);
  const handleConvertClick = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(translatedText);
      console.log(targetLanguage);
      utterance.lang = "es-ES";
      speechSynthesis.speak(utterance);
    } else {
      console.error('Speech synthesis is not supported in this browser.');
    }
  };
  const getAccessToken = async () => {
    const region = 'centralindia';
  
    try {
      const response = await axios.post(
        `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`,
        null,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': subscriptionKey,
            'Content-Type': 'application/ssml+xml',
          }
        }
      );
  
      return response.data;
    } catch (error) {
      console.error('Access token API error:', error);
      return null;
    }
  };
  const convertToAudio = async () => {
    const accessToken = await getAccessToken();
  
    if (accessToken) {
      const speechText = translatedText; // Use the translated text
  
      try {
        const response = await axios.post(
          'https://centralindia.tts.speech.microsoft.com/cognitiveservices/v1',
          {
            text: speechText,
            voice: {
              name: 'en-US-AriaRUS',
              gender: 'Female'
            },
            audioConfig: {
              audioOutputFormat: 'audio-16khz-32kbitrate-mono-mp3'
            }
          },
          {
            headers: {
              'Content-Type': 'application/ssml+xml',
              'Authorization': `Bearer ${accessToken}`
            },
            responseType: 'blob'
          }
        );
  
        const audioBlob = new Blob([response.data], { type: 'audio/mp3' });
        saveAs(audioBlob, 'audio.mp3');
      } catch (error) {
        console.error('Text-to-speech API error:', error);
      }
    }
  };
  
  
  const translateText = async () => {
    try {
      const response = await axios.post(
        'https://api.cognitive.microsofttranslator.com/translate',
        [
          {
            text
          }
        ],
        {
          headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': 'c98d8bb6f11844ba91a8bbe23323fc09',
            'Ocp-Apim-Subscription-Region': 'centralindia'
          },
          params: {
            'api-version': '3.0',
            to: targetLanguage
          }
        }
      );

      setTranslatedText(response.data[0].translations[0].text);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLanguageChange = (e) => {
    setTargetLanguage(e.target.value);
  };


  return (
    <div className="main-container">
      <h3 className="heading">Input your english text here!</h3>
      <label style={{ display: "flex", alignItems: "start" }}>Text Input</label>
      <input type="text" style={{ width: "100%", height: "1.5rem" }} onChange={(e) => setText(e.target.value)}></input>
      <select value={targetLanguage} onChange={handleLanguageChange}>
        {supportedLanguages.map((language) => {
          return(<option key={language} value={language}>
            {languageName[language].name}
          </option>);
        })}
      </select>
      {translatedText ?<h4>Transalated Text:<span style={{"color":"red"}}>{translatedText}</span></h4>: null}
      <button
        onClick={translateText}
        style={{
          "marginTop": "2rem",
          width: "100%",
          background: "#5F00A0",
          color: "white",
        }}
      >
        Translate
      </button>
      {/* <button onClick={convertToAudio}>Convert to Audio</button> */}
    </div>
  );
};

export default Home;
