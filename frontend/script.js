document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('gallery');
  const selectedImageInput = document.getElementById('selectedImage');
  const apiUrlOutput = document.getElementById('apiUrl');
  const uploadForm = document.getElementById('uploadForm');
  const uploadInput = document.getElementById('uploadInput');
  const uploadError = document.getElementById('uploadError');

  let selectedImage = '';

  // Sample images that should always be shown
  const sampleImages = ['image1.jpg', 'image2.jpg', 'image3.jpg'];

  // Function to create image element
  const createImageElement = (imgName) => {
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
    return img;
  };

  // Function to fetch and load images from server
  const loadGallery = async () => {
    if (!gallery) return;
    gallery.innerHTML = ''; // Clear gallery before loading

    // First, add sample images
    sampleImages.forEach(imgName => {
      gallery.appendChild(createImageElement(imgName));
    });
    
    try {
      // Then fetch and add uploaded images
      const response = await fetch('/api/images/list', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load images: ${response.statusText}`);
      }
      
      const images = await response.json();
      
      if (Array.isArray(images)) {
        images.forEach((imgName) => {
          if (!sampleImages.includes(imgName)) {
            gallery.appendChild(createImageElement(imgName));
          }
        });
      }
    } catch (error) {
      console.error('Error loading gallery:', error);
      if (uploadError) {
        uploadError.textContent = 'Failed to load uploaded images. Sample images still available.';
      }
    }
  };

  if (uploadForm && uploadInput && uploadError) {
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      uploadError.textContent = '';

      const file = uploadInput.files && uploadInput.files[0];
      if (!file || !file.name.endsWith('.jpg')) {
        uploadError.textContent = 'Only .jpg files are allowed.';
        return;
      }

      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/images/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Upload successful:', result);
        
        uploadForm.reset(); // Clear the form
        await loadGallery(); // Reload gallery after successful upload
      } catch (error) {
        console.error('Upload error:', error);
        uploadError.textContent = 'Failed to upload image. Please try again.';
      }
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
      const url = `/api/images/resize?filename=${selectedImage}&width=${width}&height=${height}`;
      apiUrlOutput.textContent = url;
    });
  }

  // Load gallery when page loads
  loadGallery();
});
