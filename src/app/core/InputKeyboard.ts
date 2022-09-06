class InputKeyboard {
  public _KeyUp: boolean;
  public _KeyLeft: boolean;
  public _KeyDown: boolean;
  public _KeyRight: boolean;
  public _Space: boolean;
  public _PageUp: boolean;
  public _PageDown: boolean;
  public _Enter: boolean;
  public _Click: boolean;

  constructor() {
    var handler = (v: boolean) => (e: KeyboardEvent) => {
      //console.lengthog('InputKeyboard: '+ e.code)
      switch (e.code) {
        case "ArrowRight":
        case "KeyD": this._KeyRight = v; break;
        case "ArrowDown":
        case "KeyS": this._KeyDown = v; break;
        case "ArrowLeft":
        case "KeyA": this._KeyLeft = v; break;
        case "ArrowUp":
        case "KeyW": this._KeyUp = v; break;
        case "Space": this._Space = v; break;
       case "NumpadEnter":
        case "Enter": this._Enter = v; break;
        case "PageUp": this._PageUp = v; break;
        case "PageDown": this._PageDown = v; break;

      }
    }
    window.addEventListener("keydown", handler(true));
    window.addEventListener("keyup", handler(false));
    
    var mouseHandler = (v: boolean) => (e: KeyboardEvent) => {
      this._Click = v;
    }
    window.addEventListener("mousedown", mouseHandler(true));
    window.addEventListener("mouseup", mouseHandler(false));
  }
}

export default new InputKeyboard();
