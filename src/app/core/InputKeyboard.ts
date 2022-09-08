class InputKeyboard {
  public _KeyUp: boolean;
  public _KeyLeft: boolean;
  public _KeyDown: boolean;
  public _KeyRight: boolean;
  public _Space: boolean;
  public _PageUp: boolean;
  public _PageDown: boolean;
  public _Enter: boolean;
  public _KeyM: boolean;

  constructor() {
    var handler = (v: boolean) => (e: KeyboardEvent) => {
      //console.log('InputKeyboard: '+ e.code)
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
        case "KeyM": this._KeyM = v; break;

      }
    }
    window.addEventListener("keydown", handler(true));
    window.addEventListener("keyup", handler(false));

  }
}

export default new InputKeyboard();
