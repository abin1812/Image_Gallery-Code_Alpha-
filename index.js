const darkToggle = document.getElementById('darkModeToggle');
const folderView = document.getElementById('folderView');
const imageView = document.getElementById('imageView');
const backBtn = document.getElementById('backToFolders');
const imageGrid = document.getElementById('imageGrid');

const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const previewHide = document.getElementById('previewHide');
const previewFav = document.getElementById('previewFav');
const previewDelete = document.getElementById('previewDelete');

const favouritesBtn = document.getElementById('favouritesBtn');
const hiddenBtn = document.getElementById('hiddenBtn');
const deletedBtn = document.getElementById('deletedBtn');
const hiddenSection = document.getElementById('hidden-section');
const hiddenGrid = document.getElementById('hiddenGrid');
const passwordModal = document.getElementById('passwordModal');
const passwordInput = document.getElementById('passwordInput');
const passwordSubmit = document.getElementById('passwordSubmit');
const passwordCancel = document.getElementById('passwordCancel');

const folders = [
  { name: "Nature", icon: "🌿" },
  { name: "Monuments", icon: "🏛️" },
  { name: "Animals", icon: "🐾" },
  { name: "Gadgets", icon: "💻" },
  { name: "Food", icon: "🍔" },
  { name: "Sports", icon: "🏀" },
  { name: "Quotes", icon: "💬" },
  { name: "Painting", icon: "🎨" },
  { name: "Aesthetic Photos", icon: "🌅" }
];

const imageData = {};
folders.forEach(folder => {
  imageData[folder.name] = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png'];
});

let imageToHide = '';
let isUnlockingHidden = false;
let currentFolder = '';

darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

backBtn.addEventListener('click', () => {
  folderView.classList.remove('hidden');
  imageView.classList.add('hidden');
  document.querySelector(".bottom-buttons").style.display = "flex";
});

favouritesBtn.addEventListener('click', () => {
  showFavouriteImages();
});

hiddenBtn.addEventListener('click', () => {
  imageToHide = '';
  isUnlockingHidden = true;
  folderView.classList.add('hidden');
  imageView.classList.add('hidden');
  passwordModal.classList.remove('hidden');
});

deletedBtn.addEventListener('click', () => {
  showDeletedImages();
});

passwordCancel.onclick = () => {
  passwordModal.classList.add('hidden');
  passwordInput.value = '';
};

passwordSubmit.onclick = () => {
  const password = passwordInput.value.trim();
  const correctPassword = "1812";

  if (password === correctPassword) {
    passwordModal.classList.add('hidden');
    passwordInput.value = '';

    if (isUnlockingHidden) {
      isUnlockingHidden = false;
      folderView.classList.add("hidden");
      imageView.classList.add("hidden");
      document.querySelector(".bottom-buttons").style.display = "none";
      hiddenSection.classList.remove("hidden");
      showHiddenImages();
      hiddenSection.scrollIntoView({ behavior: "smooth" });
    } else {
      let hiddenImages = JSON.parse(localStorage.getItem("hiddenImages")) || [];
      if (!hiddenImages.some(img => img.path === imageToHide)) {
        hiddenImages.push({ path: imageToHide, folder: currentFolder });
        localStorage.setItem("hiddenImages", JSON.stringify(hiddenImages));
      }
      alert("Image moved to Hidden");
    }
  } else {
    alert("Incorrect password!");
  }
};

imagePreview.addEventListener('click', (e) => {
  if (e.target === imagePreview) {
    imagePreview.classList.add('hidden');
  }
});

function renderFolders() {
  folderView.innerHTML = '';
  folders.forEach(folder => {
    const div = document.createElement('div');
    div.className = 'folder';
    div.setAttribute('data-folder', folder.name);
    div.innerHTML = `<div>${folder.icon}</div><div>${folder.name}</div>`;
    folderView.appendChild(div);
  });

  document.querySelectorAll('.folder').forEach(folderDiv => {
    folderDiv.addEventListener('click', () => {
      const folderName = folderDiv.getAttribute('data-folder');
      showImages(folderName);
    });
  });

  document.querySelector(".bottom-buttons").style.display = "flex";
}

function showImages(category) {
  currentFolder = category;
  imageGrid.innerHTML = '';
  const images = imageData[category] || [];

  const hiddenList = JSON.parse(localStorage.getItem("hiddenImages")) || [];
  const deletedList = JSON.parse(localStorage.getItem("deletedImages")) || [];

  images.forEach(src => {
    const imagePath = `${category}/${src}`;
    const isHidden = hiddenList.some(img => img.path === imagePath);
    const isDeleted = deletedList.some(img => img.path === imagePath);
    if (isHidden || isDeleted) return;

    const card = document.createElement('div');
    card.className = 'image-card';
    card.innerHTML = `<img src="images/${imagePath}" alt="${category}" data-full="${imagePath}" />`;
    imageGrid.appendChild(card);
  });

  attachFavouriteListeners();
  attachImageClickListeners();

  folderView.classList.add('hidden');
  imageView.classList.remove('hidden');
  document.querySelector(".bottom-buttons").style.display = "none";
}

function getFavourites() {
  return JSON.parse(localStorage.getItem('favourites')) || [];
}

function isFavourite(path) {
  return getFavourites().includes(path);
}

function toggleFavourite(path, icon) {
  let favs = getFavourites();
  if (favs.includes(path)) {
    favs = favs.filter(p => p !== path);
    icon.textContent = '🤍';
  } else {
    favs.push(path);
    icon.textContent = '❤️';
  }
  localStorage.setItem('favourites', JSON.stringify(favs));
}

function attachFavouriteListeners() {
  document.querySelectorAll('.favourite').forEach(icon => {
    const imagePath = icon.getAttribute('data-src');
    icon.onclick = () => toggleFavourite(imagePath, icon);
  });
}

function showFavouriteImages() {
  const favs = getFavourites();
  imageGrid.innerHTML = '';

  if (favs.length === 0) {
    imageGrid.innerHTML = '<p style="color:white;text-align:center;">No favourites yet.</p>';
  } else {
    favs.forEach(path => {
      const card = document.createElement('div');
      card.className = 'image-card';
      card.innerHTML = `<img src="images/${path}" alt="Favourite" data-full="${path}" />`;
      imageGrid.appendChild(card);
    });
    attachFavouriteListeners();
    attachImageClickListeners();
  }

  folderView.classList.add('hidden');
  imageView.classList.remove('hidden');
  document.querySelector(".bottom-buttons").style.display = "none";
}

function attachImageClickListeners() {
  document.querySelectorAll('.image-card img').forEach(img => {
    img.onclick = () => {
      const imagePath = img.getAttribute('data-full');
      showPreview(imagePath);
    };
  });
}

function showPreview(imagePath) {
  previewImg.src = `images/${imagePath}`;
  imageToHide = imagePath;
  imagePreview.classList.remove('hidden');
  previewFav.textContent = isFavourite(imagePath) ? '❤️' : '🤍';
  previewFav.onclick = () => toggleFavourite(imagePath, previewFav);

  // Reset recover button if already added
  const oldRecover = document.getElementById("previewRecover");
  if (oldRecover) oldRecover.remove();

  previewDelete.onclick = () => {
    let deletedImages = JSON.parse(localStorage.getItem("deletedImages")) || [];
    if (!deletedImages.some(img => img.path === imagePath)) {
      deletedImages.push({ path: imagePath, folder: currentFolder });
      localStorage.setItem("deletedImages", JSON.stringify(deletedImages));
    }
    const targetImg = document.querySelector(`img[data-full="${imagePath}"]`);
    if (targetImg) targetImg.closest(".image-card").remove();
    imagePreview.classList.add("hidden");
    alert("Moved to Recently Deleted");
  };

  previewHide.onclick = () => {
    isUnlockingHidden = false;
    imagePreview.classList.add('hidden');
    passwordModal.classList.remove('hidden');

    const targetImg = document.querySelector(`img[data-full="${imageToHide}"]`);
    if (targetImg) {
      targetImg.closest(".image-card").remove();
    }
  };

  const deletedImages = JSON.parse(localStorage.getItem("deletedImages")) || [];
  const isDeleted = deletedImages.some(img => img.path === imagePath);

  if (isDeleted) {
    const recoverBtn = document.createElement("button");
    recoverBtn.id = "previewRecover";
    recoverBtn.textContent = "🔄";
    recoverBtn.style.marginTop = "10px";
    recoverBtn.style.padding = "8px 16px";
    recoverBtn.style.borderRadius = "8px";
    recoverBtn.style.background = "#2b8435";
    recoverBtn.style.color = "#fff";
    recoverBtn.style.cursor = "pointer";
    recoverBtn.style.fontSize = "28px"; // 🔥 yeh line add ki gayi hai  
    previewImg.insertAdjacentElement("afterend", recoverBtn);

    recoverBtn.onclick = () => {
      let deletedList = JSON.parse(localStorage.getItem("deletedImages")) || [];
      const toRestore = deletedList.find(img => img.path === imagePath);
      deletedList = deletedList.filter(img => img.path !== imagePath);
      localStorage.setItem("deletedImages", JSON.stringify(deletedList));
      imagePreview.classList.add("hidden");
      showDeletedImages();

      if (toRestore && toRestore.folder === currentFolder) {
        showImages(currentFolder);
      }
    };
  }
}

function showHiddenImages() {
  hiddenGrid.innerHTML = '';
  const hiddenImages = JSON.parse(localStorage.getItem("hiddenImages")) || [];

  if (hiddenImages.length === 0) {
    hiddenGrid.innerHTML = '<p style="color:white;text-align:center;">No hidden images yet.</p>';
  } else {
    hiddenImages.forEach(({ path }) => {
      const card = document.createElement('div');
      card.className = 'image-card';
      card.innerHTML = `<img src="images/${path}" alt="Hidden" data-full="${path}" />`;
      hiddenGrid.appendChild(card);
    });
    attachFavouriteListeners();
    attachImageClickListeners();
  }
}

function showDeletedImages() {
  imageGrid.innerHTML = '';
  const deletedImages = JSON.parse(localStorage.getItem("deletedImages")) || [];

  if (deletedImages.length === 0) {
    imageGrid.innerHTML = '<p style="color:white;text-align:center;">No deleted images.</p>';
  } else {
    deletedImages.forEach(({ path }) => {
      const card = document.createElement('div');
      card.className = 'image-card';
      card.innerHTML = `<img src="images/${path}" alt="Deleted" data-full="${path}" />`;
      imageGrid.appendChild(card);
    });
    attachImageClickListeners();
  }

  folderView.classList.add('hidden');
  imageView.classList.remove('hidden');
  document.querySelector(".bottom-buttons").style.display = "none";
}

renderFolders();

document.getElementById('backToFoldersFromHidden').addEventListener('click', function () {
  window.location.href = "index.html";
});
