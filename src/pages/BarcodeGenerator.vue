<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold mb-6">Barcode Generator</h1>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left Panel: Configuration -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4">Barcode Configuration</h2>

          <!-- Barcode Type -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Barcode Type</label>
            <select v-model="config.barcodeType" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="CODE128">CODE128</option>
              <option value="EAN13">EAN-13</option>
              <option value="EAN8">EAN-8</option>
              <option value="UPC">UPC</option>
              <option value="CODE39">CODE39</option>
            </select>
          </div>

          <!-- Barcode Value -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Barcode Value *</label>
            <input 
              v-model="config.barcodeValue" 
              type="text" 
              placeholder="Enter barcode value"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Enter the barcode number or text</p>
          </div>

          <!-- Header Section -->
          <div class="mb-4">
            <label class="flex items-center mb-2">
              <input type="checkbox" v-model="config.showHeader" class="mr-2">
              <span class="text-sm font-medium text-gray-700">Show Header</span>
            </label>
            <div v-if="config.showHeader" class="pl-6 space-y-3">
              <div>
                <input 
                  v-model="config.headerLine1" 
                  type="text" 
                  placeholder="Line 1 (e.g., Shop Name)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <input 
                  v-model="config.headerLine2" 
                  type="text" 
                  placeholder="Line 2 (e.g., Product Name)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          <!-- Footer Section -->
          <div class="mb-4">
            <label class="flex items-center mb-2">
              <input type="checkbox" v-model="config.showFooter" class="mr-2">
              <span class="text-sm font-medium text-gray-700">Show Footer</span>
            </label>
            <div v-if="config.showFooter" class="pl-6 space-y-3">
              <div>
                <input 
                  v-model="config.footerLine1" 
                  type="text" 
                  placeholder="Line 1 (e.g., Price: 100 BDT)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <input 
                  v-model="config.footerLine2" 
                  type="text" 
                  placeholder="Line 2 (e.g., Product Code)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          <!-- Size Options -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Label Size</label>
            <select v-model="config.labelSize" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="small">Small (40mm x 25mm)</option>
              <option value="medium">Medium (50mm x 30mm)</option>
              <option value="large">Large (60mm x 40mm)</option>
              <option value="custom">Custom Size</option>
            </select>
          </div>

          <!-- Custom Size -->
          <div v-if="config.labelSize === 'custom'" class="mb-4 pl-6 space-y-3">
            <div>
              <label class="block text-sm text-gray-600 mb-1">Width (mm)</label>
              <input 
                v-model.number="config.customWidth" 
                type="number" 
                min="30" 
                max="100"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">Height (mm)</label>
              <input 
                v-model.number="config.customHeight" 
                type="number" 
                min="20" 
                max="80"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          <!-- Barcode Options -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Barcode Options</label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input type="checkbox" v-model="config.displayValue" class="mr-2">
                <span class="text-sm">Display barcode value below barcode</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" v-model="config.showBorder" class="mr-2">
                <span class="text-sm">Show border around label</span>
              </label>
            </div>
          </div>

          <!-- Font Size -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
            <input 
              v-model.number="config.fontSize" 
              type="range" 
              min="8" 
              max="16" 
              class="w-full"
            />
            <div class="flex justify-between text-xs text-gray-500">
              <span>8px</span>
              <span>{{ config.fontSize }}px</span>
              <span>16px</span>
            </div>
          </div>

          <!-- Quantity -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Number of Labels</label>
            <input 
              v-model.number="config.quantity" 
              type="number" 
              min="1" 
              max="100"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Action Buttons -->
          <div class="space-y-3">
            <button 
              @click="generateBarcode" 
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition"
            >
              Generate Barcode
            </button>
            <div class="grid grid-cols-2 gap-3">
              <button 
                @click="downloadImage('png')" 
                :disabled="!barcodeGenerated"
                class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-md transition"
              >
                Download PNG
              </button>
              <button 
                @click="downloadImage('jpeg')" 
                :disabled="!barcodeGenerated"
                class="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-md transition"
              >
                Download JPEG
              </button>
            </div>
            <button 
              @click="printBarcode" 
              :disabled="!barcodeGenerated"
              class="w-full bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-md transition"
            >
              Print Labels
            </button>
          </div>
        </div>

        <!-- Right Panel: Preview -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4">Preview</h2>
          
          <div class="space-y-4">
            <!-- Single Preview -->
            <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <p class="text-sm text-gray-600 mb-3">Single Label Preview:</p>
              
              <div class="flex justify-center">
                <div 
                  ref="previewContainer" 
                  :style="previewStyle"
                  :class="{'border-2 border-black': config.showBorder}"
                  class="bg-white flex flex-col items-center justify-center"
                  style="padding: 8px;"
                >
                  <!-- Show message if not generated -->
                  <div v-if="!barcodeGenerated" class="text-center py-8">
                    <p class="text-gray-500">Click "Generate Barcode" to see preview</p>
                  </div>
                  
                  <!-- Show barcode content when generated -->
                  <template v-else>
                    <!-- Header -->
                    <div v-if="config.showHeader" class="text-center w-full" style="margin-bottom: 4px;">
                      <div v-if="config.headerLine1" :style="{fontSize: config.fontSize + 'px'}" class="font-semibold">
                        {{ config.headerLine1 }}
                      </div>
                      <div v-if="config.headerLine2" :style="{fontSize: (config.fontSize - 1) + 'px'}">
                        {{ config.headerLine2 }}
                      </div>
                    </div>

                    <!-- Barcode -->
                    <svg ref="barcodePreview" style="margin: 2px 0;"></svg>

                    <!-- Footer -->
                    <div v-if="config.showFooter" class="text-center w-full" style="margin-top: 4px;">
                      <div v-if="config.footerLine1" :style="{fontSize: config.fontSize + 'px'}" class="font-semibold">
                        {{ config.footerLine1 }}
                      </div>
                      <div v-if="config.footerLine2" :style="{fontSize: (config.fontSize - 1) + 'px'}">
                        {{ config.footerLine2 }}
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <!-- Multiple Labels Preview -->
            <div v-if="config.quantity > 1 && barcodeGenerated" class="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <p class="text-sm text-gray-600 mb-3">Multiple Labels Preview ({{ config.quantity }} labels):</p>
              <div class="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                <div 
                  v-for="i in Math.min(config.quantity, 12)" 
                  :key="i"
                  :style="smallPreviewStyle"
                  :class="{'border border-black': config.showBorder}"
                  class="bg-white flex flex-col items-center justify-center p-1 text-xs"
                >
                  <div v-if="config.showHeader && config.headerLine1" class="font-semibold truncate w-full text-center" style="font-size: 6px;">
                    {{ config.headerLine1 }}
                  </div>
                  <div class="barcode-small my-1"></div>
                  <div v-if="config.showFooter && config.footerLine1" class="font-semibold truncate w-full text-center" style="font-size: 6px;">
                    {{ config.footerLine1 }}
                  </div>
                </div>
              </div>
              <p v-if="config.quantity > 12" class="text-xs text-gray-500 mt-2 text-center">
                Showing first 12 of {{ config.quantity }} labels
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import JsBarcode from 'jsbarcode';
import html2canvas from 'html2canvas';

export default {
  name: 'BarcodeGenerator',
  data() {
    return {
      config: {
        barcodeType: 'CODE128',
        barcodeValue: '',
        showHeader: false,
        headerLine1: '',
        headerLine2: '',
        showFooter: false,
        footerLine1: '',
        footerLine2: '',
        labelSize: 'medium',
        customWidth: 50,
        customHeight: 30,
        displayValue: true,
        showBorder: true,
        fontSize: 10,
        quantity: 1
      },
      barcodeGenerated: false
    };
  },
  computed: {
    labelDimensions() {
      const sizes = {
        small: { width: 40, height: 25 },
        medium: { width: 50, height: 30 },
        large: { width: 60, height: 40 },
        custom: { width: this.config.customWidth, height: this.config.customHeight }
      };
      return sizes[this.config.labelSize];
    },
    previewStyle() {
      const dims = this.labelDimensions;
      // Convert mm to pixels (roughly 3.78 pixels per mm)
      const pxWidth = dims.width * 3.78;
      const pxHeight = dims.height * 3.78;
      return {
        width: pxWidth + 'px',
        height: pxHeight + 'px',
        minHeight: pxHeight + 'px'
      };
    },
    smallPreviewStyle() {
      const dims = this.labelDimensions;
      const pxWidth = dims.width * 1.5;
      const pxHeight = dims.height * 1.5;
      return {
        width: pxWidth + 'px',
        height: pxHeight + 'px',
        minHeight: pxHeight + 'px'
      };
    }
  },
  methods: {
    generateBarcode() {
      console.log('Generate barcode called');
      console.log('Barcode value:', this.config.barcodeValue);
      console.log('Barcode type:', this.config.barcodeType);
      
      if (!this.config.barcodeValue) {
        alert('Please enter a barcode value');
        return;
      }

      // Set to true first so SVG element gets rendered
      this.barcodeGenerated = true;
      
      this.$nextTick(() => {
        try {
          const svg = this.$refs.barcodePreview;
          console.log('SVG element:', svg);
          
          if (!svg) {
            console.error('SVG element not found');
            alert('SVG element not found - please try again');
            this.barcodeGenerated = false;
            return;
          }

          const dims = this.labelDimensions;
          const barcodeWidth = dims.width * 3.78 * 0.8; // 80% of label width

          console.log('Generating barcode with JsBarcode...');
          JsBarcode(svg, this.config.barcodeValue, {
            format: this.config.barcodeType,
            width: 2,
            height: 40,
            displayValue: this.config.displayValue,
            fontSize: this.config.fontSize,
            margin: 2,
            valid: (valid) => {
              console.log('Barcode valid:', valid);
              if (!valid) {
                alert('Invalid barcode value for selected type. Please check and try again.');
                this.barcodeGenerated = false;
              }
            }
          });

          console.log('Barcode generated successfully');
        } catch (error) {
          console.error('Barcode generation error:', error);
          alert('Error: ' + error.message);
          this.barcodeGenerated = false;
        }
      });
    },

    async downloadImage(format) {
      if (!this.barcodeGenerated) return;

      try {
        const container = this.$refs.previewContainer;
        const canvas = await html2canvas(container, {
          backgroundColor: '#ffffff',
          scale: 3,
          logging: false,
          useCORS: true,
          allowTaint: true,
          scrollY: -window.scrollY,
          scrollX: -window.scrollX,
          windowWidth: container.scrollWidth,
          windowHeight: container.scrollHeight
        });

        const link = document.createElement('a');
        link.download = `barcode-${this.config.barcodeValue}.${format}`;
        
        if (format === 'png') {
          link.href = canvas.toDataURL('image/png');
        } else {
          link.href = canvas.toDataURL('image/jpeg', 0.95);
        }
        
        link.click();
      } catch (error) {
        console.error('Download error:', error);
        alert('Failed to download image. Please try again.');
      }
    },

    printBarcode() {
      if (!this.barcodeGenerated) return;

      const printWindow = window.open('', '_blank');
      const container = this.$refs.previewContainer;
      
      const dims = this.labelDimensions;
      const labelHTML = container.outerHTML;
      
      // Create print content with multiple labels
      let labelsHTML = '';
      for (let i = 0; i < this.config.quantity; i++) {
        labelsHTML += `<div class="label-wrapper">${labelHTML}</div>`;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Print Barcodes</title>
          <style>
            @page {
              size: ${dims.width}mm ${dims.height}mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
            .label-wrapper {
              page-break-after: always;
              width: ${dims.width}mm;
              height: ${dims.height}mm;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .label-wrapper:last-child {
              page-break-after: auto;
            }
            svg {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          ${labelsHTML}
        </body>
        </html>
      `);

      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    }
  },
  watch: {
    'config.barcodeType'() {
      if (this.config.barcodeValue) {
        this.generateBarcode();
      }
    },
    'config.displayValue'() {
      if (this.barcodeGenerated) {
        this.generateBarcode();
      }
    },
    'config.labelSize'() {
      if (this.barcodeGenerated) {
        this.generateBarcode();
      }
    },
    'config.customWidth'() {
      if (this.barcodeGenerated && this.config.labelSize === 'custom') {
        this.generateBarcode();
      }
    },
    'config.customHeight'() {
      if (this.barcodeGenerated && this.config.labelSize === 'custom') {
        this.generateBarcode();
      }
    }
  }
};
</script>

<style scoped>
.input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.barcode-small {
  width: 30px;
  height: 15px;
  background: repeating-linear-gradient(
    90deg,
    #000 0px,
    #000 1px,
    #fff 1px,
    #fff 2px
  );
}
</style>
