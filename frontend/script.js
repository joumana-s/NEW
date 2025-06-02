document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('gallery');
  const selectedImageInput = document.getElementById('selectedImage');
  const apiUrlOutput = document.getElementById('apiUrl');
  const uploadForm = document.getElementById('uploadForm');
  const uploadInput = document.getElementById('uploadInput');
  const uploadError = document.getElementById('uploadError');

  let selectedImage = '';

  // Placeholder: Replace this with real fetch from server in backend step
  const sampleImages = ['image1.jpg', 'image2.jpg', 'image3.jpg'];

  const loadGallery = () => {
    if (!gallery) return;
    gallery.innerHTML = '';
    sampleImages.forEach((imgName) => {
      const img = document.createElement('img');
      img.src = `/images/${imgName}`;
      img.alt = imgName;
      img.addEventListener('click', () => {
        if (!gallery) return;
        gallery.querySelectorAll('img').forEach(i => i.classList.remove('selected'));
        img.classList.add('selected');
        selectedImage = imgName;
        if (selectedImageInput) selectedImageInput.value = imgName;
      });
      gallery.appendChild(img);
    });
  };

  if (uploadForm && uploadInput && uploadError) {
    uploadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      uploadError.textContent = '';

      const file = uploadInput.files && uploadInput.files[0];
      if (!file || !file.name.endsWith('.jpg')) {
        uploadError.textContent = 'Only .jpg files are allowed.';
        return;
      }

      // Later: Send file via FormData to backend
      sampleImages.push(file.name); // Simulate new upload
      loadGallery();
    });
  }

  const resizeForm = document.getElementById('resizeForm');
  if (resizeForm) {
    resizeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!selectedImage) {
        alert('Please select an image.');
        return;
      }
      const widthInput = document.getElementById('width');
      const heightInput = document.getElementById('height');
      if (!widthInput || !heightInput || !apiUrlOutput) return;

      const width = widthInput.value;
      const height = heightInput.value;
      const url = `/api/images?filename=${selectedImage}&width=${width}&height=${height}`;
      apiUrlOutput.textContent = url;
    });
  }

  loadGallery();
});
