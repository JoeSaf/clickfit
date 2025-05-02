$(document).ready(function() {
    // Fetch daily fact from Numbers API
    fetchNumberFact();
    
    // Setup image upload functionality
    setupImageUpload();
    
    // Add scroll animation for navbar
    $(window).scroll(function() {
        if ($(this).scrollTop() > 50) {
            $('.navbar').css('padding', '8px 0');
            $('.navbar').css('background-color', 'rgba(33, 37, 41, 0.95)');
        } else {
            $('.navbar').css('padding', '15px 0');
            $('.navbar').css('background-color', '#212529');
        }
    });
    
    // Animate elements on scroll
    $(window).scroll(function() {
        $('.feature-box, .testimonial-card, .fact-box').each(function() {
            var elementPos = $(this).offset().top;
            var topOfWindow = $(window).scrollTop();
            var windowHeight = $(window).height();
            
            if (elementPos < topOfWindow + windowHeight - 100) {
                $(this).addClass('animated');
                $(this).css({
                    'opacity': '1',
                    'transform': 'translateY(0)'
                });
            }
        });
    });
    
    // Initialize elements with starting animation state
    $('.feature-box, .testimonial-card, .fact-box').css({
        'opacity': '0',
        'transform': 'translateY(20px)',
        'transition': 'all 0.6s ease'
    });
    
    // Smooth scrolling for navigation links
    $('a.nav-link').on('click', function(event) {
        if (this.hash !== '') {
            event.preventDefault();
            var hash = this.hash;
            
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 800, function() {
                window.location.hash = hash;
            });
        }
    });
});

// Function to fetch fact from Numbers API
function fetchNumberFact() {
    $.ajax({
        url: 'http://numbersapi.com/1/30/date?json',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            // Display the fact in the designated area
            $('#numberFact').html(data.text);
            
            // Add a fade-in animation
            $('#numberFact').hide().fadeIn(1000);
        },
        error: function(error) {
            console.error('Error fetching number fact:', error);
            $('#numberFact').html('Did you know? Regular exercise can improve your mood and mental health by releasing endorphins!');
        }
    });
}

// Function to set up image upload
function setupImageUpload() {
    const uploadArea = $('#upload-area');
    const fileInput = $('#fileInput');
    const previewContainer = $('#preview-container');
    const uploadButton = $('#uploadButton');
    const uploadProgress = $('#upload-progress');
    const uploadMessage = $('#upload-message');
    const progressBar = $('.progress-bar');
    
    let selectedFiles = [];
    
    // Click on upload area to trigger file input
    uploadArea.on('click', function() {
        fileInput.click();
    });
    
    // Handle file selection
    fileInput.on('change', function(e) {
        handleFiles(e.target.files);
    });
    
    // Drag and drop functionality
    uploadArea.on('dragover', function(e) {
        e.preventDefault();
        uploadArea.addClass('highlight');
    });
    
    uploadArea.on('dragleave', function() {
        uploadArea.removeClass('highlight');
    });
    
    uploadArea.on('drop', function(e) {
        e.preventDefault();
        uploadArea.removeClass('highlight');
        
        const dt = e.originalEvent.dataTransfer;
        const files = dt.files;
        
        handleFiles(files);
    });
    
    // Handle selected files
    function handleFiles(files) {
        if (!files || files.length === 0) return;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Check if file is an image
            if (!file.type.match('image.*')) continue;
            
            // Add file to selected files array
            selectedFiles.push(file);
            
            // Create preview
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const previewItem = $('<div class="preview-item"></div>');
                const img = $('<img>').attr('src', e.target.result);
                const removeBtn = $('<button class="remove-btn"><i class="fas fa-times"></i></button>');
                
                previewItem.append(img);
                previewItem.append(removeBtn);
                previewContainer.append(previewItem);
                
                // Setup remove button
                removeBtn.on('click', function() {
                    const index = selectedFiles.indexOf(file);
                    if (index !== -1) {
                        selectedFiles.splice(index, 1);
                    }
                    previewItem.remove();
                    
                    // Hide upload button if no files selected
                    if (selectedFiles.length === 0) {
                        uploadButton.hide();
                    }
                });
            };
            
            reader.readAsDataURL(file);
        }
        
        // Show upload button if files are selected
        if (selectedFiles.length > 0) {
            uploadButton.show();
        }
    }
    
    // Handle upload button click
    uploadButton.on('click', function() {
        if (selectedFiles.length === 0) return;
        
        // Create FormData object
        const formData = new FormData();
        
        // Add files to FormData
        for (let i = 0; i < selectedFiles.length; i++) {
            formData.append('images', selectedFiles[i]);
        }
        
        // Show progress bar
        uploadProgress.show();
        progressBar.css('width', '0%');
        uploadMessage.text('Uploading images...');
        
        // Send files to server
        $.ajax({
            url: '/upload',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            xhr: function() {
                const xhr = new window.XMLHttpRequest();
                
                xhr.upload.addEventListener('progress', function(e) {
                    if (e.lengthComputable) {
                        const percent = Math.round((e.loaded / e.total) * 100);
                        progressBar.css('width', percent + '%');
                    }
                }, false);
                
                return xhr;
            },
            success: function(response) {
                progressBar.css('width', '100%');
                uploadMessage.text('Upload successful! ' + selectedFiles.length + ' images uploaded.');
                
                // Clear selected files and preview
                selectedFiles = [];
                previewContainer.empty();
                uploadButton.hide();
                
                // Hide progress bar after a delay
                setTimeout(function() {
                    uploadProgress.hide();
                }, 3000);
            },
            error: function() {
                uploadMessage.text('Error uploading images. Please try again.');
                progressBar.css('width', '0%');
            }
        });
    });
}