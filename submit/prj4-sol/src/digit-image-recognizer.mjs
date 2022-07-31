/* The original <http://yann.lecun.com/exdb/mnist/> MNIST docs state:

       The original black and white (bilevel) images from NIST were
       size normalized to fit in a 20x20 pixel box while preserving
       their aspect ratio. The resulting images contain grey levels as
       a result of the anti-aliasing technique used by the
       normalization algorithm. the images were centered in a 28x28
       image by computing the center of mass of the pixels, and
       translating the image so as to position this point at the
       center of the 28x28 field.

    So this application draws the image on a 20x20 canvas, zoomed by a
    factor of 10 using CSS.  The drawn image is regarded as a
    black-and-white bilevel image.  The image is extracted from the
    canvas and anti-aliased using a gaussian filter.  Then the image
    is written on to a 28x28 MNIST grid with its center-of-gravity
    centered on the center of the MNIST grid.

*/

import makeKnnWsClient from './knn-ws-client.mjs';
import canvasToMnistB64 from './canvas-to-mnist-b64.mjs';


//logical size of canvas
const DRAW = { width: 20, height: 20 };

//canvas is zoomed by this factor
const ZOOM = 10;

//color used for drawing digits; this cannot be changed arbitrarily as
//the value selected from each RGBA pixel depends on it being blue.
const FG_COLOR = 'blue';

class DigitImageRecognizer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    const template = document.querySelector('#recognizer-template');
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    const wsUrl = this.getAttribute('ws-url');
    this.init(wsUrl);
  }

  static get observedAttributes() { return ['ws-url']; }
  attributeChangedCallback(name, _oldValue, newValue) {
    // alert('sfjkasdbnf');
    this.init(newValue);
  }


  /** Initialize canvas attributes, set up event handlers and attach a
   *  knn web services client for wsUrl to this.  Note that the
   *  environment for the event handlers will have access to this
   *  function's variable via their closures, in particular they will
   *  have access to the canvas, ctx, last and mouseDown variables.
   */
  init(wsUrl) {
    const shadow = this.shadowRoot;  //convenient alias

    const canvas = shadow.querySelector('#img-canvas');
    canvas.width = DRAW.width; canvas.height = DRAW.height;
    canvas.style.width = `${ZOOM * DRAW.width}.px`;
    canvas.style.height = `${ZOOM * DRAW.height}px`;

    const ctx = this.ctx = canvas.getContext("2d");

    // set up ctx attributes sufficient for this project
    ctx.lineJoin = ctx.lineCap = 'round';
    ctx.strokeStyle = FG_COLOR;
    ctx.lineWidth = 1;

    /** set up an event handler for the clear button being clicked */
    const buttonHandler = shadow.querySelector('#clear');
    // console.log('reacyed');
    buttonHandler.addEventListener('click',this.resetApp.bind(this,ctx));

    /** set up an event handler for the recognize button being clicked. */
    const classifyHandler = shadow.querySelector('#recognize');
    classifyHandler.addEventListener('click',this.recognize.bind(this,ctx));

    /** set up an event handler for the pen-width being changed. */
    const penWidthHandler = shadow.querySelector('#pen-width');
    penWidthHandler.addEventListener('change',function(event){
      ctx.lineWidth = event.target.value;
      // console.log('value updated to ' + ctx.lineWidth);


    })

    // const inputHandler = document.querySelector('#ws-url');
    // console.log('ih='+inputHandler);
    // inputHandler.addEventListener('change',(event)=>{
    //   // this.attributeChangedCallback(_name, _oldValue, event.target.value);
    // });

    
    // draw(ctx, {x: 0, y: 10}, {x: 10, y: 10})

    /** true if the mouse button is currently pressed within the canvas */
    let mouseDown = false;

    /** the last {x, y} point within the canvas where the mouse was
     *  detected with its button pressed. In logical canvas
     *  coordinates.
     */
    let last = { x: 0, y: 0 };
    let start = { x: 0, y: 0 };
    /** set up an event handler for the mouse button being pressed within
     *  the canvas.
     */
     const mouseDownHandler = shadow.querySelector('#img-canvas');
     mouseDownHandler.addEventListener('mousedown',(event)=>{
      console.log('mouseDown');
      mouseDown=true;
      start = eventCanvasCoord(mouseDownHandler,event);
      
     })
    //  const outerMouseHandler = shadow.querySelector('#recognizer');
     let outerMouse= false;
     window.addEventListener('mousedown',()=>{
      console.log('ouer');
      outerMouse=true;
     })
     window.addEventListener('mouseup',()=>{
      outerMouse=false;
     })
    
    /** set up an event handler for the mouse button being moved within
     *  the canvas.  
     */
    mouseDownHandler.addEventListener('mousemove',(event)=>{
      
      if(!mouseDown && !outerMouse)return;
      if(mouseDown){
        event.preventDefault();
      last = eventCanvasCoord(mouseDownHandler,event);
      draw(this.ctx,start,last);
      start = eventCanvasCoord(mouseDownHandler,event);
      }
      else if(outerMouse){
        event.preventDefault();
        start = eventCanvasCoord(mouseDownHandler,event);
      last = eventCanvasCoord(mouseDownHandler,event);
      draw(this.ctx,start,last);
      }
      
    })

    /** set up an event handler for the mouse button being released within
     *  the canvas.
     */
     mouseDownHandler.addEventListener('mouseup',(event)=>{
      event.preventDefault();
      mouseDown=false;
      console.log(last);
     })

    /** set up an event handler for the mouse button being moved off
     *  the canvas.
     */
    mouseDownHandler.addEventListener('mouseleave', (event)=>{
      mouseDown=false;
    })

    /** Create a new KnnWsClient instance in this */
    // const inputWsUrl = document.querySelector('#ws-url').value;
    // console.log(inputWsUrl);
    this.instance = makeKnnWsClient(wsUrl);
    console.log(wsUrl);
  }

  /** Clear canvas specified by graphics context ctx and any
   *  previously determined label 
   */
  resetApp(ctx)  {
    
    // console.log(ctx.canvas.height);
    
    ctx.clearRect(0,0,ctx.canvas.height,ctx.canvas.height );
    this.shadowRoot.querySelector('#knn-label').innerHTML='';
    console.log('TODO resetApp()');
  }

  /** Label the image in the canvas specified by canvas corresponding
   *  to graphics context ctx.  Specifically, call the relevant web
   *  services to label the image.  Display the label in the result
   *  area of the app.  Display any errors encountered.
   */
  async recognize(ctx) {
      console.log('TODO recognize()');  
    // console.log(canvasToMnistB64(ctx));
    // console.log(wsUrl);
    const response = await this.instance.classify(canvasToMnistB64(ctx));
    // console.log('idettret: ',response.id);
    // console.log(canvasToMnistB64(ctx));
    console.log("dsfhhjhdsaj",response);
    if(response.errors){ 
      console.log("resposne errror : ", response); 
      this.shadowRoot.querySelector('#knn-label').innerHTML='';
      this.reportErrors(response);
    }else {
      this.shadowRoot.querySelector('#errors').innerHTML = '';
    }
    const {id,label} = await this.instance.getImage(response.val.id);
    console.log(label);
    if(label)this.shadowRoot.querySelector('#knn-label').innerHTML=label;
  }

  /** given a result for which hasErrors is true, report all errors 
   *  in the application's error area.
   */
  reportErrors(errResult) {
    const html =
      errResult.errors.map(e => `<li>${e.message}</li>`).join('\n');
    this.shadowRoot.querySelector('#errors').innerHTML = html;
  }
	

}

/** Draw a line from {x, y} point pt0 to {x, y} point pt1 in ctx */
function draw(ctx, pt0, pt1) {
  ctx.beginPath();
  ctx.moveTo(pt0.x,pt0.y);
  ctx.lineTo(pt1.x,pt1.y);
  ctx.stroke();
}
	
/** Returns the {x, y} coordinates of event ev relative to canvas in
 *  logical canvas coordinates.
 */
function eventCanvasCoord(canvas, ev) {
  const x = (ev.pageX - canvas.offsetLeft)/ZOOM;
  const y = (ev.pageY - canvas.offsetTop)/ZOOM;
  return { x, y };
}
  
customElements.define('digit-image-recognizer', DigitImageRecognizer);


