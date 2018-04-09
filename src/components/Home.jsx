import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Icon from './Icon';
import Label from './Label';

function Home() {
  return (
    <div className="Home">
      <div className="Home-wrapper">
        <Header
          title="WebAssembly"
          subtitle="Image Playground"
          icon={
            <Icon
              name="wasm"
              size="m"
              style={{ marginRight: '10px' }}
            />
          }
        />
        <p className="Home-description">
          Lorem ipsum dolor sit amet, an pro simul laboramus repudiandae, ad usu congue eligendi.
          Vis reque tamquam verterem in. An suscipit intellegam quaerendum nam, nam no integre
          conclusionemque. Quo at quando iuvaret officiis. Ut sea quot facilis.
          Omnes iriure disputando cu qui.
        </p>
        <p className="Home-description">
          No eum malorum epicurei, in nec prima illum eirmod. Movet iuvaret legendos ea pro, 
          ex expetenda suavitate liberavisse mea. Pri no iriure alterum epicurei. Amet errem 
          ne his. Vulputate efficiendi usu te, ad mel mundi vituperatoribus, ei reque malis
          mazim sit. Sea solum audiam aperiri ex, nec eu virtute voluptua concludaturque.
        </p>
        <Link to="/image-editor">
          <Label
            text="Image Editor"
            color="#654FF0"
            size="large"
            className="Home-link"
          />
        </Link>
        <Link to="/face-detector">
          <Label
            text="Face Detector"
            color="#654FF0"
            size="large"
            className="Home-link"
          />
        </Link>
        <Link to="/webcam">
          <Label text="Webcam"
            color="#654FF0"
            size="large"
            className="Home-link"
          />
        </Link>
      </div>
    </div>
  );
}

export default Home;