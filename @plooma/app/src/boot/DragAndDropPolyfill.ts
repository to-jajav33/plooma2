/* eslint-disable @typescript-eslint/ban-ts-comment */


// class DataTransfer {
//     #dropEffect: string;
//     #effectAllowed: string;
//     #data: Record<string, unknown>;

//     constructor() {
//         this.#dropEffect = 'move';
//         this.#effectAllowed = 'all';
//         this.#data = {};
//     }

//     get dropEffect() {
//         return this.#dropEffect;
//     }
//     set dropEffect(val: string) {
//         this.#dropEffect = val;
//     }

//     get effectAllowed() {
//         return this.#effectAllowed;
//     }
//     set effectAllowed(val: string) {
//         this.#effectAllowed = val;
//     }

//     get types () {
//         return Object.keys(this.#data);
//     }

//     clearData(type: string) {
//         if (type === undefined) return;
//         if (type !== null) {
//             delete this.#data[type.toLocaleLowerCase()];
//         } else {
//             this.#data = {};
//         }
//     }

//     getData(type: string) {
//         return this.#data[type.toLowerCase()] || '';
//     }

//     setData(type: string, value: unknown) {
//         this.#data[type.toLowerCase()] = value;
//     }

//     setDragImage = function (img: ImageBitmap, offsetX: number, offsetY: number) {
//         var ddp: DragAndDropPolyfill = instance;
//         ddp._imgCustom = img;
//         ddp._imgOffset = { x: offsetX, y: offsetY };
//     };
// }

class DragAndDropPolyfill {
    // @ts-ignore
    #lastClick: number;
    // @ts-ignore
    #dataTransfer: globalThis.DataTransfer;
    #dragSource: HTMLElement | null;
    #lastTouch: null | TouchEvent | Touch;
    #lastTarget: null;
    #ptDown: null | {x: number, y: number};
    #isDragEnabled: boolean;
    #isDropZone: boolean;
    #pressHoldInterval: string | number | undefined;
    #img: HTMLImageElement | null;
    #imgCustom: null;

    constructor() {
        if (instance) return instance;

        this.#lastClick = 0;        
        this.#dragSource = null;
        this.#img = null;
        this.#imgCustom = null;
        this.#lastTouch = null;
        this.#lastTarget = null;
        this.#ptDown = null;
        this.#isDragEnabled = false;
        this.#isDropZone = false;
        this.#dataTransfer = new DataTransfer();
        clearInterval(this.#pressHoldInterval);

        let supportsPassive = false;
        document.addEventListener('test', () => { /* test */ }, {
            get passive() {
                supportsPassive = true;
                return true;
            }
        });

        if (navigator.maxTouchPoints) {
            const opts = supportsPassive ? {passive: false, capture: false} : false;

            document.addEventListener('touchstart', this.#ontouchstart, opts);
            document.addEventListener('touchmove', this.#ontouchmove, opts);
            document.addEventListener('touchend', this.#ontouchend, opts);
            document.addEventListener('touchcancel', this.#ontouchcancel, opts);
        } 
    }

    #closestDraggable(e: HTMLElement | null) {
        if (!e) return null;

        for (; e; e = e.parentElement) {
            if (e.hasAttribute('draggable') && e.draggable) {
                return e;
            }
        }
        return null;
    }

    #copyProps (dst: Record<string, unknown>, src: Record<string, unknown>, props: string[]) {
        for (let i = 0; i < props.length; i++) {
            const p = props[i];
            dst[p] = src[p];
        }
    }

    #destroyImage() {
        if (this.#img && this.#img.parentElement) {
            this.#img.parentElement.removeChild(this.#img);
        }
        this.#img = null;
        this.#imgCustom = null;
    }

    #dispatchEvent(e: TouchEvent, type: string, target: EventTarget | null) {
        if (e && target) {
            const evt = new DragEvent(type, {
                bubbles: true,
                button: 0,
                buttons: 1,
                cancelable: true,
                dataTransfer: this.#dataTransfer,
                which: 1
            });
            const t = e.touches ? e.touches[0] : e;
            this.#copyProps(evt as unknown as Record<string, unknown>, e as unknown as Record<string, unknown>, DragAndDropPolyfill.#kbdProps);
            this.#copyProps(evt as unknown as Record<string, unknown>, t as unknown as Record<string, unknown>, DragAndDropPolyfill.#ptProps);
            target.dispatchEvent(evt);
            return evt.defaultPrevented;
        }
        return false;
    }

    #getPoint(e: TouchEvent | Touch, page?: boolean) {
        let tl : Touch;
        if (e instanceof TouchEvent) {
            tl = e.touches[0];
        }
        tl = e as Touch;

        return { x: page ? tl.pageX : tl.clientX, y: page ? tl.pageY : tl.clientY };
    }

    #ontouchmove(e: TouchEvent) {
        /** @todo implement touch move from https://github.com/Bernardo-Castilho/dragdroptouch/blob/master/DragDropTouch.js */
    }

    #ontouchstart(e: TouchEvent) {
        if (this.#shouldHandle(e)) {
            if ((Date.now() - this.#lastClick) < DragAndDropPolyfill.#DBLCLICK) {
                if (this.#dispatchEvent(e, 'dblclick', e.target)) {
                    e.preventDefault();
                    this.#reset();
                    return;
                }
            }
        }

        this.#reset();

        const src = this.#closestDraggable(e.target as unknown as HTMLElement);
        if (src) {
            if (!this.#dispatchEvent(e, 'mousemove', e.target) && !this.#dispatchEvent(e, 'mousedown', e.target)) {
                this.#dragSource = src;
                this.#ptDown = this.#getPoint(e);
                this.#lastTouch = e;

                e.preventDefault();

                // show context menu if user hasn't started dragging
                setTimeout(() => {
                    if (this.#dragSource === src && this.#img === null) {
                        if (this.#dispatchEvent(e, 'contextmenu', src)) {
                            this.#reset();
                        }
                    }
                }, DragAndDropPolyfill.#CTXMENU);

                if (DragAndDropPolyfill.#ISPRESSHOLDMODE) {
                    this.#pressHoldInterval = setTimeout(() => {
                        this.#isDragEnabled = true;
                        this.#ontouchmove(e);
                    }, DragAndDropPolyfill.#PRESSHOLDAWAIT) as unknown as string | number | undefined;
                }
            }
        }
    }

    #reset() {
        this.#destroyImage();
        this.#dragSource = null;
        this.#lastTouch = null;
        this.#lastTarget = null;
        this.#ptDown = null;
        this.#isDragEnabled = false;
        this.#isDropZone = false;
        this.#dataTransfer = new DataTransfer();
        clearInterval(this.#pressHoldInterval);
    }

    #shouldHandle(e: TouchEvent) {
        return e && !e.defaultPrevented && e.touches && e.touches.length < 2;
    }

    // constants
    static get #THRESHOLD() { return 5; } // pixels to move before drag starts
    static get #OPACITY() { return 0.5; } // drag image opacity
    static get #DBLCLICK() { return 500; } // max ms between clicks in a double click
    static get #CTXMENU() { return 900; } // ms to hold before raising 'contextmenu' event
    static get #ISPRESSHOLDMODE() { return false; } // decides of press & hold mode presence
    static get #PRESSHOLDAWAIT() { return 400; } // ms to wait before press & hold is detected
    static get #PRESSHOLDMARGIN() { return 25; } // pixels that finger might shiver while pressing
    static get #PRESSHOLDTHRESHOLD() { return 0; } // pixels to move before drag starts
    // copy styles/attributes from drag source to drag image element
    static get #rmvAtts() { return 'id,class,style,draggable'.split(','); }
    // synthesize and dispatch an event
    // returns true if the event has been handled (e.preventDefault == true)
    static get #kbdProps() { return 'altKey,ctrlKey,metaKey,shiftKey'.split(','); }
    static get #ptProps() { return 'pageX,pageY,clientX,clientY,screenX,screenY,offsetX,offsetY'.split(','); }
}


const instance = new DragAndDropPolyfill();
export default instance;
