// récupère les id des boutons
const fileInput = document.getElementById("file");
const image = document.getElementById("image");
const downloadButton = document.getElementById("download");
const boutonRotationDroite = document.getElementById("rotation-droite");
const boutonRotationGauche = document.getElementById("rotation-gauche");
const boutonFlipX = document.getElementById("flip-x");
const boutonFlipY = document.getElementById("flip-y");
const imageApercu = document.getElementById("preview-image");
const options = document.querySelector(".options-btn");
const affichageMatrice = document.getElementById("matrix-display");


const axeX = document.querySelector(".image-container div:nth-child(1)");
const axeY = document.querySelector(".image-container div:nth-child(2)");

const boutonSelectContainer = document.getElementById("select-container");

const boutonHideElements = document.getElementById("hide-elements");
const matrixStyle = document.getElementById("matrix-style");

let cropper = null; // initialise le cropper (image) à null
let nomFichier = "";
let flipXActif = false, flipYActif = false;
const valeurRotationDroite = 45, valeurRotationGauche = -45; //valeur de l'angle de rotation par défaut
//matrice de transformation de base
let matriceTransformation = [
  [1, 0],
  [0, 1]
];
//mets a jour l'affichage a chaque fois qu'il y a une transformation
const mettreAJourAffichageMatrice = () => {
  if (!affichageMatrice) {
    console.error("Element 'matrix-display' introuvable.");
    return;
  }
  // Arrondir les valeurs de la matrice à 2 décimales
  affichageMatrice.innerHTML = matriceTransformation
    .map(row => `[${row.map(value => value.toFixed(2)).join(", ")}]`)
    .join("<br>");
  matrixStyle.style.display = "block";
};

//applique la transformation de la matrice sur l'image
const appliquerTransformation = (matrice) => {
  const resultat = [
    [0, 0],
    [0, 0]
  ];

  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      for (let k = 0; k < 2; k++) {
        resultat[i][j] += matriceTransformation[i][k] * matrice[k][j];
      }
    }
  }

  matriceTransformation = resultat;
  mettreAJourAffichageMatrice();
};

// affiche l'aperçu de l'image recadrée
const afficherApercu = () => {
  // Vérifie si le cropper est initialisé
  if (!cropper) {
    console.error("Cropper is not initialized.");
    return;
  }

  const croppedCanvas = cropper.getCroppedCanvas();
  if (!croppedCanvas) {
    console.error("Failed to get cropped canvas. Ensure the image is loaded and cropper is initialized.");
    return;
  }

  const imgSrc = croppedCanvas.toDataURL();
  if (!imgSrc) {
    console.error("Failed to generate image source from cropped canvas.");
    return;
  }

  console.log("Updating preview with new image source.");
  downloadButton.classList.remove("hide");
  imageApercu.classList.remove("hide");
  imageApercu.src = imgSrc;
  imageApercu.style.objectFit = "contain"; 
};
//merci github
//limite la taille de l'image à 800px
const reduceImageSize = (file, callback) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target.result;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const maxSize = 800; 
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL(file.type));
    };
  };
};

window.onload = () => {
  downloadButton.classList.add("hide");
  options.classList.add("hide");
};

//masque ou affiche les boutons
const toggleVisibility = (element, show) => {
  element.style.display = show ? "flex" : "none";
};

// met à jour les axes X et Y
const updateAxes = () => {
  const imageContainer = document.querySelector(".image-container");
  const axisX = document.getElementById("axis-x");
  const axisY = document.getElementById("axis-y");

  const containerRect = imageContainer.getBoundingClientRect();

  axisX.style.width = `${containerRect.width}px`;
  axisX.style.top = `${containerRect.height / 2}px`;

  axisY.style.height = `${containerRect.height}px`;
  axisY.style.left = `${containerRect.width / 2}px`;
};

//met à jour les axes X et Y au chargement de la page
fileInput.onchange = () => {
  // Réinitialise les positions et la matrice
  matriceTransformation = [
    [1, 0],
    [0, 1]
  ];
  mettreAJourAffichageMatrice();

  rotationState = 0;
  flipXState = false;
  flipYState = false;
  updateDottedBlock();

  reduceImageSize(fileInput.files[0], (reducedDataUrl) => {
    image.setAttribute("src", reducedDataUrl);
    image.onload = () => {
      if (cropper) {
        cropper.destroy();
      }
      cropper = new Cropper(image, {
        ready: () => {
          afficherApercu();
          updateAxes(); 
        },
        crop: updateAxes,
        move: updateAxes,
        zoom: updateAxes
      });
      options.classList.remove("hide");
      toggleVisibility(document.querySelector(".image-container"), true);
      toggleVisibility(document.querySelector(".preview-container"), true);
      nomFichier = fileInput.files[0].name.split(".")[0];
      
    };
  });
};

// mets à jour les infos dans la matrices quand on applique une rotation
const rotateImage = (angle) => {
  cropper.rotate(angle);
  const radian = (angle * Math.PI) / 180;
  appliquerTransformation([
    [Math.cos(radian), Math.sin(radian)],
    [-Math.sin(radian), Math.cos(radian)]
  ]);
  afficherApercu();
};

boutonRotationDroite.addEventListener("click", () => rotateImage(valeurRotationDroite));
boutonRotationGauche.addEventListener("click", () => rotateImage(valeurRotationGauche));

// mets à jour les infos dans la matrice si on retourne en X ou en Y
const flipImage = (axis) => {
  if (axis === 'X') {
    cropper.scaleX(flipXActif ? 1 : -1);
    flipXActif = !flipXActif;
    appliquerTransformation([
      [-1, 0],
      [0, 1]
    ]);
  } else { // axis === 'Y'
    cropper.scaleY(flipYActif ? 1 : -1);
    flipYActif = !flipYActif;
    appliquerTransformation([
      [1, 0],
      [0, -1]
    ]);
  }
  afficherApercu();
};

boutonFlipX.addEventListener("click", () => flipImage('X'));
boutonFlipY.addEventListener("click", () => flipImage('Y'));

document.getElementById('flip-x').addEventListener('click', () => {
  const dottedBlock = document.getElementById('dotted-block');

  // Vérifie si c'est "haut-droit" et la change en "haut-gauche"
  if (dottedBlock.style.borderRight) {
    dottedBlock.style.borderLeft = dottedBlock.style.borderRight; // Copie la bordure
   
  } else if (dottedBlock.style.borderLeft) {
    dottedBlock.style.borderRight = dottedBlock.style.borderLeft; // Copie 
   
  }
});

document.getElementById('flip-x').addEventListener('click', () => {
  const dottedBlock = document.getElementById('dotted-block');

  // Récupère la largeur actuelle
  const currentWidth = parseFloat(dottedBlock.style.width);

  // Inverse la largeur en passant sa valeur en négatif
  if (!isNaN(currentWidth)) {
    dottedBlock.style.width = `${-currentWidth}%`;
  } else {
    console.error("La largeur actuelle n'est pas définie ou n'est pas un nombre valide.");
  }
});

// met à jour les infos dans la matrice si on allonge ou compresse l'image
const scaleImage = (axis, factor) => {
  if (axis === 'X') {
    const newScaleX = cropper.getData().scaleX * factor;
    cropper.scaleX(newScaleX);
    appliquerTransformation([
      [factor, 0],
      [0, 1]
    ]);
  } else if (axis === 'Y') {
    const newScaleY = cropper.getData().scaleY * factor;
    cropper.scaleY(newScaleY);
    appliquerTransformation([
      [1, 0],
      [0, factor]
    ]);
  }
  afficherApercu();
};

// récupère les boutons pour allonger ou compresser
document.getElementById('allonger-x').addEventListener('click', () => scaleImage('X', 1.2));
document.getElementById('compresser-x').addEventListener('click', () => scaleImage('X', 1 / 1.2));
document.getElementById('allonger-y').addEventListener('click', () => scaleImage('Y', 1.2));
document.getElementById('compresser-y').addEventListener('click', () => scaleImage('Y', 1 / 1.2));

// télécharge l'image recadrée
downloadButton.addEventListener("click", () => {
  const imgSrc = cropper.getCroppedCanvas().toDataURL();
  downloadButton.download = `cropped_${nomFichier}.png`;
  downloadButton.setAttribute("href", imgSrc);
});

// affiche ou masque les axes X et Y 
boutonSelectContainer.addEventListener("click", () => {
  const imageContainer = document.querySelector(".image-container");
  if (cropper) {
    cropper.setCropBoxData({
      left: 0,
      top: 0,
      width: imageContainer.offsetWidth,
      height: imageContainer.offsetHeight
    });
    afficherApercu();
  } else {
    console.error("Cropper n'est pas initialisé.");
  }
});



let rotationState = 0; 
let flipXState = false; // retournement horizontal
let flipYState = false; // retournement vertical
const dottedBlock = document.getElementById('dotted-block');
// Met à jour la rotation et le retournement du bloc pointillé
const updateDottedBlock = () => {
  
  dottedBlock.style.transform = `translate(-50%, -50%) rotate(${rotationState}deg) scaleX(${flipXState ? -1 : 1}) scaleY(${flipYState ? -1 : 1})`;
};

// rotation à droite de 45 degré
document.getElementById('rotation-droite').addEventListener('click', () => {
  rotationState = (rotationState + valeurRotationDroite) % 360; // Incrémente la rotation de 45° (modulo 360)
  updateDottedBlock();
});

// rotation à gauche de 45 degré
document.getElementById('rotation-gauche').addEventListener('click', () => {
  rotationState = (rotationState + valeurRotationGauche + 360) % 360; // Décrémente la rotation de 45° (modulo 360 pour éviter les valeurs négatives)
  updateDottedBlock();
});

// retournement horizontal
document.getElementById('flip-x').addEventListener('click', () => {
  flipXState = !flipXState; // Inverse l'état de retournement horizontal
  updateDottedBlock();
});

// retournement vertical
document.getElementById('flip-y').addEventListener('click', () => {
  flipYState = !flipYState; // Inverse l'état de retournement vertical
  updateDottedBlock();
});

// mets à jour la position de l'angle pointilé
updateDottedBlock();

boutonHideElements.addEventListener("click", () => {
  const elements = [axeX, axeY, dottedBlock];
  const areVisible = elements.every(element => element.style.display !== "none");
  elements.forEach(element => {
    element.style.display = areVisible ? "none" : "block";
    afficherApercu();
  });
});