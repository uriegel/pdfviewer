const template = document.createElement('template')
template.innerHTML = `  
    <style>
        :host {
            --pdfviewer-background-color : gray;
        }
        #control {
            height: 100%;
            width: 100%;
            background-color: var(--pdfviewer-background-color);
        }   
    </style>
    <div id="control">
        <div>
            <button id="prev">Previous</button>
            <button id="next">Next</button>
            <span>Page: <span id="page_num"></span> / <span id="page_count"></span></span>
        </div>
        <canvas id="the-canvas"></canvas>
    </div>
` 

class PdfViewer extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open'})
        this.shadowRoot.appendChild(template.content.cloneNode(true))
        this.control = this.shadowRoot.getElementById("control")
    }

    connectedCallback() {
    }

    load(pdfUrl) {
        const loadJS = (url, location) => {
            //url is URL of external file, implementationCode is the code
            //to be called from the file, location is the location to 
            //insert the <script> element
          
            const scriptTag = document.createElement('script')
            scriptTag.src = url
            scriptTag.onload = () => this.run(pdfUrl)
            scriptTag.onreadystatechange = () => this.run(pdfUrl)
          
            location.appendChild(scriptTag)
        }
        loadJS('//mozilla.github.io/pdf.js/build/pdf.js', document.body);
    }

    run(url) {
        // Loaded via <script> tag, create shortcut to access PDF.js exports.
        var pdfjsLib = window['pdfjs-dist/build/pdf'];
      
        // The workerSrc property shall be specified.
        pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';
      
        var pdfDoc = null,
          pageNum = 1,
          pageRendering = false,
          pageNumPending = null,
          scale = 0.8,
          canvas = this.shadowRoot.getElementById('the-canvas'),
          ctx = canvas.getContext('2d');
      
        /**
         * Get page info from document, resize canvas accordingly, and render page.
         * @param num Page number.
         */
        function renderPage(num) {
          pageRendering = true;
          // Using promise to fetch the page
          pdfDoc.getPage(num).then(function(page) {
            var viewport = page.getViewport({
              scale: scale
            });
            canvas.height = viewport.height;
            canvas.width = viewport.width;
      
            // Render PDF page into canvas context
            var renderContext = {
              canvasContext: ctx,
              viewport: viewport
            };
            var renderTask = page.render(renderContext);
      
            // Wait for rendering to finish
            renderTask.promise.then(function() {
              pageRendering = false;
              if (pageNumPending !== null) {
                // New page rendering is pending
                renderPage(pageNumPending);
                pageNumPending = null;
              }
            });
          });
      
          // Update page counters
          this.shadowRoot.getElementById('page_num').textContent = num;
        }
      
        /**
         * If another page rendering in progress, waits until the rendering is
         * finised. Otherwise, executes rendering immediately.
         */
        function queueRenderPage(num) {
          if (pageRendering) {
            pageNumPending = num;
          } else {
            renderPage(num);
          }
        }
      
        /**
         * Displays previous page.
         */
        function onPrevPage() {
          if (pageNum <= 1) {
            return;
          }
          pageNum--;
          queueRenderPage(pageNum);
        }
        this.shadowRoot.getElementById('prev').addEventListener('click', onPrevPage);
      
        /**
         * Displays next page.
         */
        function onNextPage() {
          if (pageNum >= pdfDoc.numPages) {
            return;
          }
          pageNum++;
          queueRenderPage(pageNum);
        }
        this.shadowRoot.getElementById('next').addEventListener('click', onNextPage);
      
        /**
         * Asynchronously downloads PDF.
         */

        const pagecount = this.shadowRoot.getElementById('page_count')
        pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
          pdfDoc = pdfDoc_;
          pagecount.textContent = pdfDoc.numPages;
      
          // Initial/first page rendering
          renderPage(pageNum);
        });
      }
}

customElements.define('pdf-viewer', PdfViewer)

