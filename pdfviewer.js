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

// TODO https://stackoverflow.com/questions/13038146/pdf-js-scale-pdf-on-fixed-width
// TODO Loading task destroy https://github.com/mozilla/pdf.js/issues/9048

class PdfViewer extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open'})
        this.shadowRoot.appendChild(template.content.cloneNode(true))
        this.control = this.shadowRoot.getElementById("control")
		this.canvas = this.shadowRoot.getElementById('the-canvas')
    }

    connectedCallback() {
        this.shadowRoot.getElementById('prev').addEventListener('click', () => {
        	if (this.pageNum > 1) 
				this.queueRenderPage(--this.pageNum)
		})
      
        this.shadowRoot.getElementById('next').addEventListener('click', () => {
			if (this.pageNum < this.pdfDoc.numPages) 
				this.queueRenderPage(++this.pageNum)
		})
    }

    async load(url) {
		const loadPdfScripts = async () => new Promise(res => {
            const script = document.createElement('script')
            script.src = '//mozilla.github.io/pdf.js/build/pdf.js'
            script.onload = () => res()
            //scriptTag.onreadystatechange = () => this.run(pdfUrl)
            document.body.appendChild(script)
		})

		if (!this.pdfjsLib) {
			await loadPdfScripts()
	        // Loaded via <script> tag, create shortcut to access PDF.js exports.
			this.pdfjsLib = window['pdfjs-dist/build/pdf']
			// The workerSrc property shall be specified.
			this.pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js'
		}

		this.run(url)			
	}

    async run(url) {
      
		this.pdfDoc = null
		this.pageNum = 1
		this.pageRendering = false
		this.pageNumPending = null
		this.scale = 0.8
        this.ctx = this.canvas.getContext('2d')
      
        /**
         * Asynchronously downloads PDF.
         */
        const pagecount = this.shadowRoot.getElementById('page_count')
        this.pdfDoc = await this.pdfjsLib.getDocument(url).promise
      	pagecount.textContent = this.pdfDoc.numPages
      
      	// Initial/first page rendering
       	this.renderPage(this.pageNum)
    }

 	async renderPage(num) {
		this.shadowRoot.getElementById('page_num').textContent = num
		this.pageRendering = true;
		// Using promise to fetch the page
		const page = await this.pdfDoc.getPage(num)
		const viewport = page.getViewport({
			scale: this.scale
		})
		this.canvas.height = viewport.height
		this.canvas.width = viewport.width

		// Render PDF page into canvas context
		const renderContext = {
			canvasContext: this.ctx,
			viewport: viewport
		}
		await page.render(renderContext).promise
		this.pageRendering = false
		if (this.pageNumPending) {
			this.renderPage(this.pageNumPending)
			this.pageNumPending = null
		}
	}

	/**
	 * If another page rendering in progress, waits until the rendering is
	 * finised. Otherwise, executes rendering immediately.
	 */
	queueRenderPage(num) {
		if (this.pageRendering) 
			this.pageNumPending = num
		else 
			this.renderPage(num)
	}
}

customElements.define('pdf-viewer', PdfViewer)

