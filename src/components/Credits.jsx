import React from 'react';
import Header from './Header';
import Icon from './Icon';

function Credits() {
  return (
    <div className="credits">
      <Header title="Credits"/>
      <p><Icon name="alert" size="xs" className="credits-icon" /> "Alert" icon by Fabiano Coelho, from thenounproject.com. </p>
      <p><Icon name="benchmark" size="xs" className="credits-icon" /> "Gauge" icon by Guilhem, from thenounproject.com. </p>
      <p><Icon name="change" size="xs" className="credits-icon" /> "Change" icon by Royyan Razka, from thenounproject.com. </p>
      <p><Icon name="check" size="xs" className="credits-icon" /> "Done" icon by Besticons, from thenounproject.com. </p>
      <p><Icon name="close" size="xs" className="credits-icon bg-black" /> "Close" icon by Sergey Demushkin, from thenounproject.com. </p>
      <p><Icon name="drag" size="xs" className="credits-icon" /> "Drag And Drop" icon by icon 54, from thenounproject.com. </p>
      <p><Icon name="drop" size="xs" className="credits-icon" /> "Drag And Drop" icon by icon 54, from thenounproject.com. </p>
      <p><Icon name="faceBlur" size="xs" className="credits-icon bg-black" /> "Anonymity" icon by Ralf Schmitzer, from thenounproject.com. </p>
      <p><Icon name="faceRect" size="xs" className="credits-icon bg-black" /> "Scanner Face" icon by Thomas Helbig, from thenounproject.com. </p>
      <p><Icon name="glasses" size="xs" className="credits-icon" /> "Glasses" icon by Vicons Design, from thenounproject.com. </p>
      <p><Icon name="results" size="xs" className="credits-icon bg-black" /> "Stats" icon by Gregor Cresnar, from thenounproject.com. </p>
      <p><Icon name="sad" size="xs" className="credits-icon" /> "Sad" icon by Brian Dys Sahagun, from thenounproject.com. </p>
      <p><Icon name="setup" size="xs" className="credits-icon bg-black" /> "Setup" icon by Juraj Sedlák, from thenounproject.com. </p>
      <p><Icon name="shades" size="xs" className="credits-icon" /> "Sunglasses" icon by Daniela Baptista, from thenounproject.com. </p>
    </div>
  );
}

export default Credits;
