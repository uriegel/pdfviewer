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
    </div>
` 

class PdfViewer extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open'})
        this.shadowRoot.appendChild(template.content.cloneNode(true))
        this.control = this.shadowRoot.getElementById("control")

        console.log("Bin geladen")
    }

    connectedCallback() {
        console.log("werde verbunden")
    }
}

customElements.define('pdf-viewer', PdfViewer)