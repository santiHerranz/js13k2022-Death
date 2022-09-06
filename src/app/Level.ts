import V2 from "./core/V2"


export default class Level {

    public _index: number = 0
    public _lastIndex: number = 0

    public _tiles: V2
    public _maxZombies: number[] = [] // zombie waves
    public _maxHumans: number = 0
    public _maxHearts: number = 0
    public _maxSwords: number = 0
    public _maxDiamonds: number = 0

    public _currentDiamonds: number = 0
    public _currentHumanRescued: number = 0
    public _currentZombiesKilled: number = 0
    public _currentHumansKilled: number = 0


    public _totalDiamonds: number = 0
    public _totalHumanRescued: number = 0
    public _totalZombieKilled: number = 0
    public _totalHumanKilled: number = 0


    public _colors: string[] = []
    public _scorePoints: number = 0
    public _scoreDiamonds: number = 0

    public _isUnLock: boolean = false
    public _playerHasSword: boolean

    public _isFirst: boolean = false
    public _isEndGame: boolean = false

    public _startTilePos: V2
    public _exitTilePos: V2
    public _lockTilePos: V2
    public _keyTilePos: V2
    public _swordSpawner: V2
    public _heartSpawner: V2


    //    public get _number(): number { return - this._levelDef.length + 1 + this._index }
    public get _number(): number { return this._index }

    public static _shadowColor = "rgba(0,0,0,.5)"
    public static _transparent = "rgba(0,0,0,0)"
    public static _lavaColor = "rgba(255,0,0,.3)"
    public static _translucid = "rgba(0,0,255,.3)"

    // 0:_TRANSPARENT, 1:_BASE, 2:_XTILE, 3: _LAVA, 4: _HOLE
    private _colorsDef = [
        [Level._transparent, "#2D2316", "#2D2316", Level._lavaColor, Level._translucid], // 0
        [Level._transparent, "#3D2F1E", "#3D2F1E", Level._lavaColor, Level._translucid], // 1
        [Level._transparent, "#4C3B26", "#4C3B26", Level._lavaColor, Level._translucid], // 2
        [Level._transparent, "#5B462D", "#5B462D", Level._lavaColor, Level._translucid], // 3
        [Level._transparent, "#6B5235", "#6B5235", Level._lavaColor, Level._translucid], // 4
        [Level._transparent, "#7A5E3C", "#7A5E3C", Level._lavaColor, Level._translucid], // 5
        [Level._transparent, "#896A44", "#896A44", Level._lavaColor, Level._translucid], // 6
        [Level._transparent, "#896A44", "#896A44", Level._lavaColor, Level._translucid], // 7
        [Level._transparent, "#896A44", "#896A44", Level._lavaColor, Level._translucid], // 8
        [Level._transparent, "#896A44", "#896A44", Level._lavaColor, Level._translucid], // 9
        [Level._transparent, "#438742", "#438742", Level._lavaColor, Level._translucid]  // 10
    ]

    /* Level definition
    tt: tiles x tiles
    z: zombies
    h: humans
    s: swords
    c: tile colors
    */
    public _levelState = []

    public _levelCode = [


        [   // Level 0  
            8, 8, // grid x, y
            2, 4, // start tile and player at x+1,y-1
            4, 6, // exit tile and lock
            4, 6, // lock tile
            6, 4, // key tile
            0, 7, // sword spawner tile
            [1], // zombies
            0, // humans
            0, // hearts
            1, // swords
            3, // diamonds  
        ],

        [   // Level 1  
            12, 12, // grid x, y
            2, 4, // start tile and player at x+1,y-1
            7, 9, // exit tile
            7, 9, // lock tile
            9, 2, // key tile
            0, 0, // sword spawner tile
            [2, 2, 2], // zombies
            0, // humans
            1, // hearts
            0, // swords
            10, // diamonds  
        ],

        [   // Level 2 - 
            30, 8,  // grid x, y
            5, 3, // start tile and player at x+1,y-1
            22, 2, // exit tile
            28, 5, // lock tile
            10, 1, // key tile
            2, 2, // sword spawner tile
            [8,8,16], // zombies
            2, // humans
            2, // hearts
            2, // swords
            20, // diamonds  
        ],

        [   // Level 3 - 
            30, 7,  // grid x, y
            5, 3, // start tile and player at x+1,y-1
            26, 3, // exit tile
            26, 3, // loack tile
            10, 1, // key tile
            2, 2, // sword spawner tile
            [10, 10, 10], // zombies
            6, // humans
            5, // hearts
            3, // swords
            30, // diamonds  
        ],

        [   // Level 4 - 
            10, 30,  // grid x,y
            5, 5, // start tile and player at x+1,y-1
            3, 26, // exit tile
            3, 26, // lock tile
            1, 14, // key tile
            2, 2, // sword spawner tile
            [5, 5, 5], // zombies
            20, // humans
            5, // hearts
            4, // swords
            40, // diamonds  
        ],


        [   // Level 5 - 
            30, 7, // grid x,y
            25, 3, // start tile and player at x+1,y-1
            5, 3, // exit tile
            5, 3, // lock tile
            15, 1, // key tile
            2, 2, // sword spawner tile
            [5, 5, 30], // zombies
            6, // humans
            5, // hearts
            3, // swords
            50, // diamonds  
        ],


        [   // Level 6 - 
            30, 30, // grid x,y
            10, 10, // start tile and player at x+1,y-1
            5, 3, // exit tile
            5, 3, // lock tile
            15, 10, // key tile
            8, 8, // sword spawner tile
            [10, 15, 30], // zombies
            20, // humans
            5, // hearts
            10, // swords
            50, // diamonds  
        ],

        [   // Level 7 - 
            20, 20, // grid x,y
            4, 4, // start tile and player at x+1,y-1
            16, 16, // exit tile
            4, 16, // lock tile
            16, 4, // key tile
            10, 10, // sword spawner tile
            [20, 20, 40], // zombies
            30, // humans
            10, // hearts
            10, // swords
            60, // diamonds  
        ],

        [   // Level 8 - 
            25, 25, // grid x, y
            3, 1, // start tile and player at x+1,y-1
            12, 4, // exit tile
            12, 4, // lock tile
            20, 20, // key tile
            6, 3, // sword spawner tile
            [10, 30, 60], // zombies
            10, // humans
            3, // hearts
            5, // swords
            60, // diamonds  
        ],

        [   // Level 9 - 
            25, 25, // grid x, y
            23, 23, // start tile and player at x+1,y-1
            20, 4, // exit tile
            12, 12, // lock tile
            3, 20, // key tile
            4, 4, // sword spawner tile
            [10, 10], // zombies
            30, // humans
            3, // hearts
            5, // swords
            60, // diamonds  
        ],

        [   // Level 10 - End Game
            20, 20, // grid x,y
            5, 7, // start tile and player at x+1,y-1
            0, 0, // exit tile
            0, 0, // lock tile
            0, 0, // key tile
            0, 0, // sword spawner tile
            [0], // zombies waves
            0, // humans
            0, // hearts
            0, // swords
            0, // diamonds        
        ],

    ]


    constructor() {
        this._index = this._lastIndex = 0 // 0 - 6: FINAL BOSS, 7: END

        this._levelCode.forEach((a: number[], index) => {
            this._levelState.push({
                c: this._colorsDef[index],           // level colors
                _tiles: new V2(a[0], a[1]),          // grid size tiles x tiles
                _playerTilePos: new V2(a[2], a[3]),  // start tile
                _exitTilePos: new V2(a[4], a[5]),    // exit tile 
                _lockTilePos: new V2(a[6], a[7]),    // lock tile 
                _keyTilePos: new V2(a[8], a[9]),     // key tile
                _swordSpawner: new V2(a[10], a[11]), // sword spawner
                _maxZombies: a[12],                  // total zombies in level
                _maxHumans: a[13],                   // total humans in level
                _maxHearts: a[14],                   // total hearts in level
                _maxSwords: a[15],                   // total swords in level
                _maxDiamonds: a[16],                 // total diamonds in level
                _currentHumanRescued: 0,
                _currentDiamonds: 0,
                _currentZombiesKilled: 0,
                _currentHumansKilled: 0,
                _isUnLock: false
            })
        })

        this._init()
    }

    _init() {

        const state = this._levelState[this._index]

        this._colors = state.c
        this._tiles = state._tiles
        this._startTilePos = state._playerTilePos
        this._exitTilePos = state._exitTilePos
        this._lockTilePos = state._lockTilePos
        this._keyTilePos = state._keyTilePos
        this._swordSpawner = state._swordSpawner
        this._maxZombies = state._maxZombies
        this._maxHumans = state._maxHumans
        this._maxHearts = state._maxHearts
        this._maxSwords = state._maxSwords
        this._maxDiamonds = state._maxDiamonds
        this._isUnLock = state._isUnLock

        this._currentHumanRescued = state._currentHumanRescued
        this._currentDiamonds = state._currentDiamonds
        this._currentZombiesKilled = state._currentZombiesKilled
        this._currentHumansKilled = state._currentHumansKilled

        this._isFirst = this._index == 0
        this._isEndGame = this._index == this._levelState.length - 1




    }

    _levelIncrement() {
        if (this._index >= 0 && this._index + 1 < this._levelState.length) {
            this._saveState()
            this._lastIndex = this._index++
        }
    }

    _levelDecrement() {
        if (this._index > 0 && this._index - 1 < this._levelState.length) {
            this._saveState()
            this._lastIndex = this._index--
        }
    }

    _saveState() {
        const state = this._levelState[this._index]

        state._isUnLock = this._isUnLock
        state._currentHumanRescued = this._currentHumanRescued
        state._currentDiamonds = this._currentDiamonds
        state._currentZombiesKilled = this._currentZombiesKilled
        state._currentHumansKilled = this._currentHumansKilled
        state._maxZombies = this._maxZombies
        state._maxHumans = this._maxHumans
    }

    _calculateStats() {
        this._totalHumanRescued = 0+this._levelState.reduce((acc, c) => acc + c._currentHumanRescued, 0)
        this._totalDiamonds = 0+this._levelState.reduce((acc, c) => acc + c._currentDiamonds, 0)
        this._totalZombieKilled = 0+this._levelState.reduce((acc, c) => acc + c._currentZombiesKilled, 0)
        this._totalHumanKilled = 0+this._levelState.reduce((acc, c) => acc + c._currentHumansKilled, 0)
    
    }

}

