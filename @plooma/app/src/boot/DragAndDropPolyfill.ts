/* eslint-disable @typescript-eslint/ban-ts-comment */

let instance: undefined | DragAndDropPolyfill = undefined;

// class DataTransferPolyfill {
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

//     setDragImage = function (img: HTMLImageElement, offsetX: number, offsetY: number) {
//         instance = instance || new DragAndDropPolyfill();
//         const ddp: DragAndDropPolyfill = instance;
//         ddp.imgCustom = img;
//         ddp.imgOffset = { x: offsetX, y: offsetY };
//     };
// }

class DragAndDropPolyfill {
    // @ts-ignore
    #lastClick: number;
    // @ts-ignore
    #dataTransfer: DataTransfer;
    #dragSource: HTMLElement | null = null;
    #lastTouch: null | TouchEvent | Touch = null;
    #lastTarget: null | Element = null;
    #ptDown: null | {x: number, y: number} = null;
    #isDragEnabled = false;
    #isDropZone = false;
    #pressHoldInterval: string | number | undefined;
    #img: HTMLElement | null | undefined;
    #imgCustom: null | Node = null;
    #imgOffset: { x: number, y: number } = {x: 0, y: 0};
    ontouchend: null | ((e: TouchEvent) => void) = null;
    ontouchmove: null | ((e: TouchEvent) => void) = null;
    ontouchstart: null | ((e: TouchEvent) => void) = null;

    constructor() {
        if (instance) return instance;

        this.ontouchend = this.#ontouchend.bind(this);
        this.ontouchmove = this.#ontouchmove.bind(this);
        this.ontouchstart = this.#ontouchstart.bind(this);

        this.#lastClick = 0;        
        this.#dragSource = null;
        this.#img = null;
        this.#imgCustom = null;
        this.#imgOffset = {x: 0, y: 0};
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

            document.addEventListener('touchstart', this.ontouchstart, opts);
            document.addEventListener('touchmove', this.ontouchmove, opts);
            document.addEventListener('touchend', this.ontouchend, opts);
            document.addEventListener('touchcancel', this.ontouchend, opts);
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
            try {
                dst[p] = src[p];
            } catch(e) {
                const str = typeof e === 'string' ? e : e instanceof Error ? e.message : e;
                if (typeof str === 'string' && str.includes('which has only a getter')) continue;
                console.warn(str);
            }
        }
    }

    #copyStyle(src: Element, dst: Element) {
        // remove potentially troublesome attributes
        DragAndDropPolyfill.#rmvAtts.forEach(function (att) {
            dst.removeAttribute(att);
        });
        // copy canvas content
        if (src instanceof HTMLCanvasElement) {
            const cSrc = src as unknown as HTMLCanvasElement;
            const cDst = dst as unknown as HTMLCanvasElement;
            cDst.width = cSrc.width;
            cDst.height = cSrc.height;
            cDst.getContext('2d')?.drawImage(cSrc, 0, 0);
        }
        // copy style (without transitions)
        const cs = getComputedStyle(src);
        for (let i = 0; i < cs.length; i++) {
            const key = cs[i];
            if (key.indexOf('transition') < 0) {
                // @ts-ignore
                dst.style[key] = cs[key];
            }
        }

        const changedDST = dst as unknown as HTMLElement;
        changedDST.style.pointerEvents = 'none';
        // and repeat for all children
        for (let i = 0; i < src.children.length; i++) {
            this.#copyStyle(src.children[i], changedDST.children[i]);
        }
    }

    #createImage(e: TouchEvent) {
        if (this.#img) {
            this.#destroyImage();
        }

        if (!this.#imgCustom && !this.#dragSource) return;        

        const src = (this.#imgCustom || this.#dragSource) as Element;
        this.#img = src?.cloneNode(true) as HTMLElement;

        this.#copyStyle(src, this.#img);
        this.#img.style.top = this.#img.style.left = '-9999px';
        // if creating from drag source, apply offset and opacity
        if (!this.#imgCustom) {
            const rc = src.getBoundingClientRect(), pt = this.#getPoint(e);
            this.#imgOffset = { x: pt.x - rc.left, y: pt.y - rc.top };
            this.#img.style.opacity = DragAndDropPolyfill.#OPACITY.toString();
        }
        // add image to document
        this.#moveImage(e);
        document.body.appendChild(this.#img);
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
                dataTransfer: this.dataTransfer as unknown as DataTransfer,
                which: 1
            });
            const t = e.touches && e.touches.length ? e.touches[0] : e;
            this.#copyProps(evt as unknown as Record<string, unknown>, e as unknown as Record<string, unknown>, DragAndDropPolyfill.#kbdProps);
            this.#copyProps(evt as unknown as Record<string, unknown>, t as unknown as Record<string, unknown>, DragAndDropPolyfill.#ptProps);
            target.dispatchEvent(evt);
            return evt.defaultPrevented;
        }
        return false;
    }

    #getDelta(e: TouchEvent) {
        if (DragAndDropPolyfill.#ISPRESSHOLDMODE && !this.#ptDown) { return 0; };

        const p = this.#getPoint(e);
        if (!this.#ptDown) {
            this.#ptDown = p;
            return 0;
        }


        return Math.abs(p.x - this.#ptDown.x) + Math.abs(p.y - this.#ptDown.y);
    }

    #getPoint(e: TouchEvent | Touch, page?: boolean) {
        let tl : Touch;
        if (e instanceof TouchEvent) {
            tl = e.touches[0];
        }
        tl = e as Touch;

        return { x: page ? tl.pageX : tl.clientX, y: page ? tl.pageY : tl.clientY };
    }

    #getTarget(e: TouchEvent) {
        const pt = this.#getPoint(e);
        let el = document.elementFromPoint(pt.x, pt.y);

        while (el && self.getComputedStyle(el).pointerEvents === 'none') {
            el = el.parentElement;
        }

        return el;
    }

    get imgCustom() {
        return this.#imgCustom;
    }
    set imgCustom(val: Node | null) {
        this.#imgCustom = val;
    }

    get imgOffset() {
        return this.#imgOffset;
    }
    set imgOffset(val: {x: number, y: number}) {
        this.#imgOffset = val;
    }

    get dataTransfer() {
        if (!this.#dataTransfer) this.dataTransfer = new DataTransfer();
        return this.#dataTransfer;
    }
    set dataTransfer(val: DataTransfer) {
        this.#dataTransfer = val;
    }

    #moveImage(e: TouchEvent) {
        requestAnimationFrame(() => {
            if (this.#img) {
                const pt = this.#getPoint(e, true);
                const s = this.#img.style;
                s.position = 'absolute';
                s.pointerEvents = 'none';
                s.zIndex = '999999';
                s.left = Math.round(pt.x - this.#imgOffset.x) + 'px';
                s.top = Math.round(pt.y - this.#imgOffset.y) + 'px';
            }
        });
    }

    #ontouchend (e: TouchEvent) {
        if (this.#shouldHandle(e)) {
            if (!this.#lastTouch) this.#lastTouch = e;
            
            // see if target wants to handle up
            if (this.#dispatchEvent(this.#lastTouch as TouchEvent, 'mouseup', e.target)) {
                e.preventDefault();
                return;
            }
            // user clicked the element but didn't drag, so clear the source and simulate a click
            if (!this.#img) {
                this.#dragSource = null;
                this.#dispatchEvent(this.#lastTouch as TouchEvent, 'click', e.target);
                this.#lastClick = Date.now();
            }
            // finish dragging
            this.#destroyImage();
            if (this.#dragSource) {
                if (e.type.indexOf('cancel') < 0 && this.#isDropZone) {
                    this.#dispatchEvent(this.#lastTouch as TouchEvent, 'drop', this.#lastTarget);
                }
                this.#dispatchEvent(this.#lastTouch as TouchEvent, 'dragend', this.#dragSource);
                this.#reset();
            }
        }
    };

    #ontouchmove(e: TouchEvent) {
        if (this.#shouldCancelPressHoldMove(e)) {
            this.#reset();
            return;
        }

        if (this.#shouldHandleMove(e) || this.#shouldHandlePressHoldMove(e)) {
            const target = this.#getTarget(e);

            if (this.#dispatchEvent(e, 'mousemove', target)) {
                this.#lastTouch = e;
                e.preventDefault();
                return;
            }

            if (!this.#lastTouch) this.#lastTouch = e;

            if (this.#dragSource && !this.#img && this.#shouldStartDragging(e)) {
                if (this.#dispatchEvent(this.#lastTouch as TouchEvent, 'dragstart', this.#dragSource)) {
                    this.#dragSource = null;
                    return;
                }

                this.#createImage(e);
                this.#dispatchEvent(e, 'dragcenter', target);
            }

            // continue drag
            if (this.#img) {
                this.#lastTouch = e;
                e.preventDefault();
                this.#dispatchEvent(e, 'drag', this.#dragSource);

                if (target !== this.#lastTarget) {
                    this.#dispatchEvent(this.#lastTouch, 'dragleave', this.#lastTarget);
                    this.#dispatchEvent(e, 'dragenter', target);
                    this.#lastTarget = target;
                }
                this.#moveImage(e);
                this.#isDropZone = this.#dispatchEvent(e, 'dragover', target);
            }
        }
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

    #shouldCancelPressHoldMove(e: TouchEvent) {
        return DragAndDropPolyfill.#ISPRESSHOLDMODE && !this.#isDragEnabled && this.#getDelta(e) > DragAndDropPolyfill.#PRESSHOLDMARGIN;
    }

    #shouldHandle(e: TouchEvent) {
        return e && !e.defaultPrevented && e.touches && e.touches.length < 2;
    }

    #shouldHandleMove(e: TouchEvent) {
        return DragAndDropPolyfill.#ISPRESSHOLDMODE && this.#shouldHandle(e);
    }

    #shouldHandlePressHoldMove(e: TouchEvent) {
        return DragAndDropPolyfill.#ISPRESSHOLDMODE && this.#isDragEnabled && e && e.touches && e.touches.length;
    }

    #shouldStartDragging(e: TouchEvent) {
        const delta = this.#getDelta(e);

        return delta > DragAndDropPolyfill.#THRESHOLD || (DragAndDropPolyfill.#ISPRESSHOLDMODE && delta >= DragAndDropPolyfill.#PRESSHOLDTHRESHOLD);
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


instance = new DragAndDropPolyfill();
export default instance;
