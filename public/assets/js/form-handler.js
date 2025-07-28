/**
 * =====================================================
 * FRIMOUSSE PÂTISSERIE - FORMULARIO CON BACKEND
 * =====================================================
 * 
 * Manejo del formulario de cotización sin cálculos de precios
 * Los precios se envían EXCLUSIVAMENTE por WhatsApp
 * Incluye manejo de imágenes y envío al backend
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎂 Frimousse Pâtisserie - Formulario cargado (SIN PRECIOS)');
    
    // Elementos del formulario
    const form = document.getElementById('cakeQuoteForm');
    const guestsInput = document.getElementById('guests');
    const guestCount = document.getElementById('guestCount');
    const deliveryAlert = document.getElementById('deliveryAlert');
    
    // Variables para manejo de archivos
    let selectedFiles = [];
    const maxFiles = 5;
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    
    // Actualizar contador de invitados y lógica de entrega
    const homeDeliveryRadio = document.getElementById('homeDelivery');
    if (guestsInput && guestCount) {
        function updateGuestAndDeliveryLogic() {
            const guests = parseInt(guestsInput.value);
            guestCount.textContent = guests;
            // Mostrar alerta para entrega a domicilio (<100)
            if (deliveryAlert) {
                if (guests < 100) {
                    deliveryAlert.style.display = 'block';
                } else {
                    deliveryAlert.style.display = 'none';
                }
            }
            // Bloquear opción de entrega a domicilio si <100
            if (homeDeliveryRadio) {
                if (guests < 100) {
                    homeDeliveryRadio.disabled = true;
                    // Si estaba seleccionada, deselecciona y oculta sección
                    if (homeDeliveryRadio.checked) {
                        homeDeliveryRadio.checked = false;
                        const homeDeliverySection = document.getElementById('homeDeliverySection');
                        if (homeDeliverySection) homeDeliverySection.style.display = 'none';
                    }
                } else {
                    homeDeliveryRadio.disabled = false;
                }
            }
        }
        // Inicializar en carga
        updateGuestAndDeliveryLogic();
        guestsInput.addEventListener('input', updateGuestAndDeliveryLogic);
    }
    
    // Manejo de tipos de pastel
    const cakeTypeRadios = document.querySelectorAll('input[name="cakeType"]');
    cakeTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Remover clase selected de todas las cards
            document.querySelectorAll('.cake-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            // Agregar clase selected a la card activa
            const parentCard = this.closest('.cake-card');
            if (parentCard) {
                parentCard.classList.add('selected');
            }
            
            // Ocultar todas las secciones
            document.querySelectorAll('.cake-options-section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Mostrar la sección correspondiente
            if (this.value === 'threeMilk') {
                document.getElementById('threeMilkSection').style.display = 'block';
            } else if (this.value === 'custom') {
                document.getElementById('customSection').style.display = 'block';
            } else if (this.value === 'premium') {
                document.getElementById('premiumSection').style.display = 'block';
            }
        });
    });
    
    // Manejo de alergias
    const allergyRadios = document.querySelectorAll('input[name="allergies"]');
    allergyRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const allergyDetails = document.getElementById('allergyDetails');
            if (this.value === 'yes') {
                allergyDetails.style.display = 'block';
                document.getElementById('allergyDescription').required = true;
            } else {
                allergyDetails.style.display = 'none';
                document.getElementById('allergyDescription').required = false;
            }
        });
    });
    
    // Manejo de tipo de entrega
    const deliveryTypeRadios = document.querySelectorAll('input[name="deliveryType"]');
    deliveryTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const homeDeliverySection = document.getElementById('homeDeliverySection');
            if (this.value === 'home') {
                homeDeliverySection.style.display = 'block';
            } else {
                homeDeliverySection.style.display = 'none';
            }
        });
    });
    
    // Fecha mínima para entrega (mínimo 2 días desde hoy)
    const deliveryDateInput = document.getElementById('deliveryDate');
    if (deliveryDateInput) {
        const today = new Date();
        const minDate = new Date(today.getTime() + (2 * 24 * 60 * 60 * 1000));
        deliveryDateInput.min = minDate.toISOString().split('T')[0];
    }
    
    // Manejo de subida de imágenes
    const fileInput = document.getElementById('designFiles');
    const imagePreview = document.getElementById('imagePreview');
    const fileUploadArea = document.querySelector('.file-upload');
    
    // Hacer clickeable el área de upload
    if (fileUploadArea && fileInput) {
        fileUploadArea.addEventListener('click', function() {
            fileInput.click();
        });
    }
    
    if (fileInput && imagePreview) {
        fileInput.addEventListener('change', function() {
            handleFileSelection(this.files);
        });
    }
    
    function handleFileSelection(files) {
        // Validar número de archivos
        if (files.length > maxFiles) {
            showMessage(`⚠️ Máximo ${maxFiles} imágenes permitidas`, 'warning');
            return;
        }
        
        selectedFiles = [];
        imagePreview.innerHTML = '';
        
        if (files.length === 0) {
            imagePreview.innerHTML = '<small style="color:#666;font-style:italic;">Las imágenes seleccionadas aparecerán aquí</small>';
            return;
        }
        
        Array.from(files).forEach((file, index) => {
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                showMessage(`⚠️ ${file.name} no es una imagen válida`, 'warning');
                return;
            }
            
            // Validar tamaño
            if (file.size > maxFileSize) {
                showMessage(`⚠️ ${file.name} es muy grande (máximo 5MB)`, 'warning');
                return;
            }
            
            selectedFiles.push(file);
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const imgContainer = document.createElement('div');
                imgContainer.style.cssText = 'position:relative;width:100px;height:100px;border-radius:8px;overflow:hidden;border:2px solid #ddd;margin:5px;';
                
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
                
                const fileName = document.createElement('p');
                fileName.textContent = file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name;
                fileName.style.cssText = 'margin:5px 0 0 0;font-size:10px;text-align:center;color:#666;word-break:break-all;';
                
                const removeBtn = document.createElement('button');
                removeBtn.innerHTML = '×';
                removeBtn.type = 'button';
                removeBtn.style.cssText = 'position:absolute;top:-5px;right:-5px;width:20px;height:20px;border-radius:50%;background:#dc3545;color:white;border:none;cursor:pointer;font-size:12px;';
                removeBtn.addEventListener('click', function() {
                    const fileIndex = selectedFiles.indexOf(file);
                    if (fileIndex > -1) {
                        selectedFiles.splice(fileIndex, 1);
                    }
                    imgContainer.remove();
                    if (selectedFiles.length === 0) {
                        imagePreview.innerHTML = '<small style="color:#666;font-style:italic;">Las imágenes seleccionadas aparecerán aquí</small>';
                    }
                    
                    // Actualizar el input file
                    const dt = new DataTransfer();
                    selectedFiles.forEach(f => dt.items.add(f));
                    fileInput.files = dt.files;
                });
                
                imgContainer.appendChild(img);
                imgContainer.appendChild(fileName);
                imgContainer.appendChild(removeBtn);
                imagePreview.appendChild(imgContainer);
            };
            reader.readAsDataURL(file);
        });
    }
    
    // Envío del formulario
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validar campos requeridos
            if (!validateForm()) {
                return;
            }
            
            // Mostrar indicador de carga
            showLoadingMessage();
            
            // Enviar formulario
            submitForm();
        });
    }
    
    function validateForm() {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        let firstError = null;
        
        requiredFields.forEach(field => {
            field.style.borderColor = '';
            
            if (field.type === 'radio') {
                const radioGroup = form.querySelectorAll(`input[name="${field.name}"]`);
                const isChecked = Array.from(radioGroup).some(radio => radio.checked);
                if (!isChecked) {
                    isValid = false;
                    radioGroup.forEach(radio => {
                        const container = radio.closest('.cake-card, .allergy-option, .delivery-option');
                        if (container) {
                            container.style.borderColor = '#dc3545';
                        }
                    });
                    if (!firstError) firstError = field;
                }
            } else if (field.type === 'checkbox') {
                if (!field.checked) {
                    isValid = false;
                    field.style.borderColor = '#dc3545';
                    if (!firstError) firstError = field;
                }
            } else {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#dc3545';
                    if (!firstError) firstError = field;
                }
            }
        });
        
        if (!isValid) {
            showMessage('❌ Por favor completa todos los campos obligatorios marcados con *', 'error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        
        return isValid;
    }
    
    async function submitForm() {
        try {
            const formData = new FormData();
            // Agregar todos los campos requeridos por el modelo Quote
            formData.append('fullName', form.fullName.value || '');
            formData.append('contact', form.contact.value || '');
            formData.append('socialMedia', form.socialMedia.value || '');
            formData.append('guests', parseInt(form.guests.value, 10) || 10);
            formData.append('designChanges', form.designChanges.value || '');
            formData.append('cakeType', form.cakeType ? form.cakeType.value : '');
            formData.append('threeMilkFlavor', form.threeMilkFlavor ? form.threeMilkFlavor.value : '');
            formData.append('breadFlavor', form.breadFlavor ? form.breadFlavor.value : '');
            formData.append('fillingFlavor', form.fillingFlavor ? form.fillingFlavor.value : '');
            formData.append('premiumCake', form.premiumCake ? form.premiumCake.value : '');
            const allergy = form.querySelector('input[name="allergies"]:checked');
            formData.append('allergies', allergy ? (allergy.value === 'yes') : false);
            formData.append('allergyDescription', form.allergyDescription ? form.allergyDescription.value : '');
            formData.append('deliveryDate', form.deliveryDate.value ? new Date(form.deliveryDate.value).toISOString() : '');
            formData.append('deliveryTime', form.deliveryTime ? form.deliveryTime.value : '');
            const deliveryType = form.querySelector('input[name="deliveryType"]:checked');
            formData.append('deliveryType', deliveryType ? deliveryType.value : '');
            formData.append('homeDeliveryAddress', form.homeDeliveryAddress ? form.homeDeliveryAddress.value : '');
            formData.append('agreement', !!form.agreement.checked);
            // Agregar imágenes seleccionadas
            selectedFiles.forEach((file, index) => {
                formData.append('designFiles', file);
            });
            // Enviar al backend como multipart/form-data
            const response = await fetch('/api/quotes', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                showSuccessMessage(result);
                form.reset();
                selectedFiles = [];
                imagePreview.innerHTML = '<small style="color:#666;font-style:italic;">Las imágenes seleccionadas aparecerán aquí</small>';
                document.querySelectorAll('.cake-card').forEach(card => {
                    card.classList.remove('selected');
                });
                document.querySelectorAll('.cake-options-section').forEach(section => {
                    section.style.display = 'none';
                });
            } else {
                showMessage(`❌ Error: ${result.message || result.error || 'Error desconocido'}`, 'error');
            }
        } catch (error) {
            console.error('Error enviando formulario:', error);
            showMessage('❌ Error de conexión. Por favor intenta nuevamente.', 'error');
        }
    }
    
    function showLoadingMessage() {
        const message = document.createElement('div');
        message.id = 'loadingMessage';
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            text-align: center;
            min-width: 300px;
        `;
        
        message.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 15px;">🎂</div>
            <h3 style="color: #667eea; margin-bottom: 10px;">Enviando solicitud...</h3>
            <p style="color: #666;">Por favor espera un momento</p>
            <div style="margin-top: 15px;">
                <div style="display: inline-block; width: 20px; height: 20px; border: 3px solid #667eea; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
            </div>
        `;
        
        // Agregar animación de spinner
        if (!document.getElementById('spinnerStyle')) {
            const style = document.createElement('style');
            style.id = 'spinnerStyle';
            style.textContent = `
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(message);
        
        // Crear overlay
        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
        `;
        document.body.appendChild(overlay);
    }
    
    function hideLoadingMessage() {
        const message = document.getElementById('loadingMessage');
        const overlay = document.getElementById('loadingOverlay');
        if (message) message.remove();
        if (overlay) overlay.remove();
    }
    
    function showSuccessMessage(result) {
        hideLoadingMessage();
        // Eliminar cualquier banner anterior
        const oldBanner = document.getElementById('quoteBanner');
        if (oldBanner) oldBanner.remove();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Banner data desde el backend
        const banner = result.data.banner;
        // Crear el banner visualmente atractivo
        const bannerDiv = document.createElement('div');
        bannerDiv.id = 'quoteBanner';
        bannerDiv.style.cssText = `
            margin: 30px auto 0 auto;
            max-width: 500px;
            background: linear-gradient(135deg, #f8e1f4 0%, #e0e7ff 100%);
            border-radius: 22px;
            box-shadow: 0 6px 32px rgba(102,126,234,0.13);
            padding: 32px 28px 28px 28px;
            text-align: center;
            border: 2px solid #a259b5;
            position: relative;
            z-index: 10;
        `;
        bannerDiv.innerHTML = `
            <img src="${banner.logo}" alt="Logo" style="width:70px;height:70px;object-fit:contain;margin-bottom:10px;">
            <h2 style="color:#a259b5;font-family:'Playfair Display',serif;font-weight:700;margin-bottom:8px;">${banner.title}</h2>
            <p style="color:#333;font-size:1.1em;margin-bottom:18px;">${banner.message}</p>
            <div style="margin-bottom:18px;">
                <span style="display:inline-block;background:#e0e7ff;color:#667eea;font-weight:600;padding:6px 16px;border-radius:12px;font-size:1em;">📋 Cotización: <b>${result.data.quoteNumber}</b></span>
            </div>
            <div style="display:flex;justify-content:center;gap:18px;margin-bottom:10px;flex-wrap:wrap;">
                <a href="${banner.whatsappLink}" target="_blank" style="display:inline-flex;align-items:center;gap:8px;background:#25d366;color:white;font-weight:600;padding:12px 22px;border-radius:8px;font-size:1.1em;text-decoration:none;box-shadow:0 2px 8px rgba(37,211,102,0.13);transition:background 0.2s;">
                    <i class="fab fa-whatsapp"></i> WhatsApp
                </a>
                <a href="${banner.pdfUrl}" target="_blank" style="display:inline-flex;align-items:center;gap:8px;background:#667eea;color:white;font-weight:600;padding:12px 22px;border-radius:8px;font-size:1.1em;text-decoration:none;box-shadow:0 2px 8px rgba(102,126,234,0.13);transition:background 0.2s;">
                    <i class="fas fa-file-pdf"></i> Descargar PDF
                </a>
            </div>
            <div style="color:#888;font-size:0.98em;margin-top:10px;">⏰ Tiempo de respuesta: 2-4 horas en horario laboral<br>💡 Los precios NO se muestran en documentos web, solo por WhatsApp.</div>
        `;

        // Insertar el banner antes del formulario
        const formContainer = document.querySelector('.form-container');
        if (formContainer) {
            formContainer.parentNode.insertBefore(bannerDiv, formContainer);
        } else {
            document.body.insertBefore(bannerDiv, document.body.firstChild);
        }
    }
    
    function showMessage(text, type = 'info') {
        hideLoadingMessage();
        
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 400px;
            font-weight: 500;
        `;
        
        message.textContent = text;
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 5000);
    }
    
    // Botón volver arriba
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTop.style.display = 'flex';
            } else {
                backToTop.style.display = 'none';
            }
        });
        
        backToTop.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Efectos de interacción
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = '#667eea';
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.style.borderColor = '#e9ecef';
            }
        });
    });
    
    console.log('✅ Formulario inicializado correctamente');
});
