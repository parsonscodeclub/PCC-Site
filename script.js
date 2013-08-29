(function(){
    var canvas = document.getElementById("logo");
    var ctx = canvas.getContext("2d");
    var cw = canvas.width = $(window).width();
    var ch = canvas.height = 399;

    var gridSquares = [];
    var logoSquares = [];
    var logoWidth = 0; //this gets set in whichever draw method you're using
    var logoHeight = 0; //this gets set in whichever draw method you're using
    var gs = 80;

    var rafID;
    var allAnimationDone = true;

    /* Palettes
    *
    * Indexes:
    * 0 - main bg color
    * 1 - secondary bg color
    * 2 - main logo color
    * 3 - secondary logo color
    * 4,5,6 - tertiary bg colors
    */
    var palettes = [];
    var currentPalette = 0;
    //original: lime green, blue, purple, orange
    palettes.push(["#00A9A6","#4457A6","#D1DC28","#9AC93B","#93D6C5","#066082","#f99b1d"]);
    //burning
    palettes.push(["#32002A","#500C23","#EB702A","#EB702A","#8F0F2F","#BE2327","#BE2327"]);
    //black and white
    //palettes.push(["#FFFFFF","#000000","#000000","#000000","#000000","#FFFFFF","#000000"]);
    //grayscale
    palettes.push(["#FFFFFF","#F8F8F8","#111111","#222222","#F4F4F4","#F6F6F6","#F2F2F2"]);
    //lavender clouds
    palettes.push(["#E9F29D","#B7C29D","#51456B","#67617A","#878E8F","#878E8F","#878E8F"]);
    //beach dream
    palettes.push(["#207178","#174C4F","#FF9666","#FF9666","#FFE184","#FFE184","#F5E9BE"]);
    //raspberry
    palettes.push(["#400313","#A64B75","#A9BF04","#DBF227","#F2ACCD","#F2ACCD","#F2ACCD"]);
    //pink
    palettes.push(["#D9435F","#F24472","#F2F2F2","#F2F2F2","#F2AEB4","#F2AEB4","#2A3740"]);
    //sands of time
    palettes.push(["#C1B398","#605951","#61A6AB","#ACCEC0","#FBEEC2","#FBEEC2","#FBEEC2"]);
    //secrets in a bottle
    palettes.push(["#FFB286","#F4E39E","#F6706D","#F6706D","#8D5966","#8D5966","#C6E8F2"]);
    

    /* GridSquare
    *
    * An object that holds 4 segments, and a location that each segment refers to.
    * Also has functions that delegate animation to each segment, with an offset.
    *
    */
    function GridSquare(x, y, size, kindMap) {
        this.x = x;
        this.y = y;
        this.s = size;
        this.segments = [];
        for(var i = 0; i < 4; i++) {
            var seg = new Segment(this, i, kindMap ? kindMap[i] : Segment.BACKGROUND);
            this.segments.push(seg);
        }
        this.draw = function() {
            for(var i = 0; i < this.segments.length; i++) {
                this.segments[i].draw();
            }
        }
        this.kickOffAnimation = function() {
            var kickoffClosure = function(me, i) {
                me.segments[i].kickOffAnimation();
            }
            for(var i = 0; i < this.segments.length; i++) {
                setTimeout(kickoffClosure, this.segments[i].direction*100, this, i);
            }
        }
        this.update = function() {
            for(var i = 0; i < this.segments.length; i++) {
                this.segments[i].update();
            }
        }
    }

    /* Segment
    *
    * A triangle in a grid square, basically.
    * Holds info about what direction it represents (North, South, East, West)
    * As well as what it's used for, which determines its color
    * Also has two points and two target points, for animation.
    *
    */          
    function Segment(parent, direction, kind) {
        this.parent = parent;
        this.centerx = this.parent.x + this.parent.s/2;
        this.centery = this.parent.y + this.parent.s/2;
        this.direction = direction;
        if( this.direction === Segment.NORTH ) {
            this.pointAx = this.parent.x;
            this.pointAy = this.parent.y;
            this.pointBx = this.parent.x + this.parent.s;
            this.pointBy = this.parent.y;
        } else if ( this.direction === Segment.EAST ) {
            this.pointAx = this.parent.x + this.parent.s;
            this.pointAy = this.parent.y;
            this.pointBx = this.parent.x + this.parent.s;
            this.pointBy = this.parent.y + this.parent.s;
        } else if ( this.direction === Segment.SOUTH ) {
            this.pointAx = this.parent.x + this.parent.s;
            this.pointAy = this.parent.y + this.parent.s;
            this.pointBx = this.parent.x;
            this.pointBy = this.parent.y + this.parent.s;
        } else if ( this.direction === Segment.WEST ) {
            this.pointAx = this.parent.x;
            this.pointAy = this.parent.y + this.parent.s;
            this.pointBx = this.parent.x;
            this.pointBy = this.parent.y;
        } else { /* something wrong */ }
        this.targetAx = this.pointAx;
        this.targetAy = this.pointAy;
        this.targetBx = this.pointBx;
        this.targetBy = this.pointBy;
        this.kind = kind;
        this.color = Segment.prototype.determineColor(this.kind, palettes[currentPalette]);
        this.animating = false;
    }
    
    
    /* determines color based off what kind of segment it is.
    * contains logic for selecting from a palette based on a fixed ratio.
    */  
    Segment.prototype.determineColor = function (kind, palette) {
        var roll = Math.random();
        switch(kind) {
            case Segment.LOGO :
                if ( roll < 0.3 ) {
                    return palette[3];
                } else {
                    return palette[2];
                }
            break;
            case Segment.BACKGROUND :
                if ( roll <= 0.7 ) {
                    return palette[0];
                } else if (roll > 0.7 && roll < 0.8 ) {
                    return palette[1];
                } else if (roll > 0.8 && roll < 0.85 ) {
                    return palette[2];
                } else if (roll > 0.85 && roll < 0.9) {
                    return palette[4];
                } else if (roll > 0.9 && roll < 0.95) {
                    return palette[5];
                } else {
                    return palette[6];                  
                }
            break;
            case Segment.LOGOBACKGROUND :
                if ( roll <= 0.7 ) {
                    return palette[0];
                } else if (roll > 0.7 && roll < 0.8 ) {
                    return palette[1];
                } else if (roll > 0.8 && roll < 0.9) {
                    return palette[4];
                } else if (roll > 0.9 && roll < 0.95) {
                    return palette[5];
                } else {
                    return palette[6];                  
                }
            break;
            case Segment.TRANSPARENT :
            default:
                return "rgba(255,255,255,0)";
            break;
        }
    }

    Segment.prototype.kickOffAnimation = function() {
        if(!this.animating) {
            this.animating = true;
            this.targetAx = this.pointBx;
            this.targetAy = this.pointBy;
            this.targetBx = this.pointAx;
            this.targetBy = this.pointAy;
        }
    }

    Segment.prototype.update = function() {
        if(this.pointAx === this.targetAx &&
            this.pointAy === this.targetAy &&
            this.pointBx === this.targetBx &&
            this.pointBy === this.targetBy) {
            //oh my god this is so hack-y
            if(this.animating && 
                logoSquares.indexOf(this.parent) === logoSquares.length - 1 &&
                this.direction === 3) {
                cancelAnimationFrame(rafID);
                allAnimationDone = true;
            }
            this.animating = false;
            return;
        }
        this.pointAx = rvutil.moveValueTowards(this.pointAx, this.targetAx);
        this.pointAy = rvutil.moveValueTowards(this.pointAy, this.targetAy);
        this.pointBx = rvutil.moveValueTowards(this.pointBx, this.targetBx);
        this.pointBy = rvutil.moveValueTowards(this.pointBy, this.targetBy);
        if(this.pointAx === this.pointBx && this.pointAy === this.pointBy) {
            //recolor
            this.color = Segment.prototype.determineColor(this.kind, palettes[currentPalette]);
        }
    }
    
    Segment.prototype.draw = function() {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.pointAx, this.pointAy);
        ctx.lineTo(this.centerx, this.centery);
        ctx.lineTo(this.pointBx, this.pointBy);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 0.7;
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    
    /* kinds
    * refers to the purpose of the segment, whether it be for a background,
    * the logo,
    * or transparent, or maybe something else in the future.
    */
    Segment.LOGO = "used for the PCC";
    Segment.BACKGROUND = "used for background";
    Segment.TRANSPARENT = "used when working with multiple layers";
    Segment.LOGOBACKGROUND = "used when you don't want colors to obstruct the logo"
    
    /* directions
    * refers to which quadrant of the GridSquare a segment is.
    */
    Segment.NORTH = 0; //top
    Segment.EAST = 1; //right
    Segment.SOUTH = 2; //bottom
    Segment.WEST = 3; //left
                            
    /* make the background grid */
    function makeBackgroundGrid(gridSquares) {
        var numRows = Math.round(ch / gs) + 1;
        var numCols = Math.round(cw / gs) + 1;
        var tempKindMap, roll, dist;
        for(var i = 0; i < numCols; i++) {
            for(var j = 0; j < numRows; j++) {
                tempKindMap = [];
                for(var k = 0; k < 4; k++) {
                    dist = rvutil.dist(i*gs + gs/2, j*gs + gs/2, gs*Math.floor(numCols/2), gs*Math.floor(numRows/2));
                    roll = rvutil.map(dist, gs*3, gs*logoWidth, 0, 1);
                    // roll += rvutil.random(-0.3, 0.3);
                    if(roll > 0.5) {
                        tempKindMap[k] = Segment.BACKGROUND;
                    } else {
                        tempKindMap[k] = Segment.LOGOBACKGROUND;
                    }
                }
                gridSquares.push( new GridSquare(i*gs, j*gs, gs, tempKindMap) );
            }
        }
    }
    
    //smaller, more blocky logo
    function makeOldLogoGrid(logoSquares) {
        logoWidth = 6;
        logoHeight = 3;
        var full = [ Segment.LOGO, Segment.LOGO, Segment.LOGO, Segment.LOGO ];
        var e = Segment.TRANSPARENT; //empty
        //P
        logoSquares.push( new GridSquare(0, 0, gs, 
            [ e, Segment.LOGO, Segment.LOGO, e ]) );
        logoSquares.push( new GridSquare(0, gs, gs, 
            full) );
        logoSquares.push( new GridSquare(0, gs*2, gs, 
            full) );
        logoSquares.push( new GridSquare(gs, 0, gs, 
            [e, e, Segment.LOGO, Segment.LOGO ]) );
        logoSquares.push( new GridSquare(gs, gs, gs, 
            [Segment.LOGO, e, e, Segment.LOGO ]) );
        logoSquares.push( new GridSquare(gs, gs*2, gs, 
           [e,e,e,e]) );
        
        //C
        logoSquares.push( new GridSquare(gs*2, 0, gs, 
            [e, Segment.LOGO, Segment.LOGO, e]) );
        logoSquares.push( new GridSquare(gs*2, gs, gs, 
            full) );
        logoSquares.push( new GridSquare(gs*2, gs*2, gs, 
            [Segment.LOGO, Segment.LOGO, e, e]) );
        logoSquares.push( new GridSquare(gs*3, 0, gs, 
            [e, e, Segment.LOGO, Segment.LOGO]) );
        logoSquares.push( new GridSquare(gs*3, gs*2, gs, 
            [Segment.LOGO, e, e, Segment.LOGO]) );
        logoSquares.push( new GridSquare(gs*3, gs, gs, 
           [e,e,e,e]) );

        //other C
        logoSquares.push( new GridSquare(gs*4, 0, gs, 
            [e, Segment.LOGO, Segment.LOGO, e]) );
        logoSquares.push( new GridSquare(gs*4, gs, gs, 
            full) );
        logoSquares.push( new GridSquare(gs*4, gs*2, gs, 
            [Segment.LOGO, Segment.LOGO, e, e]) );
        logoSquares.push( new GridSquare(gs*5, 0, gs, 
            [e,e,Segment.LOGO, Segment.LOGO]) );
        logoSquares.push( new GridSquare(gs*5, gs*2, gs, 
            [Segment.LOGO, e, e, Segment.LOGO]) );
        logoSquares.push( new GridSquare(gs*5, gs, gs, 
           [e,e,e,e]) );
    }

    //newer, more hi-res version that requires
    //smaller squares
    function makeNewLogoGrid(logoSquares) {
        logoWidth = 11;
        logoHeight = 7;
        var logo = Segment.LOGO;
        var full = [ Segment.LOGO, Segment.LOGO, Segment.LOGO, Segment.LOGO ];
        var nothing = Segment.TRANSPARENT;
        var empty = [ nothing, nothing, nothing, nothing ]

        //P
        for(var i = 0; i < 7; i++) {
            for(var j = 0; j < 3; j++) {
                if( j == 0 ) {
                    if( i == 0 ) {
                        logoSquares.push( new GridSquare(0, gs*i, gs, 
                            [nothing, logo, logo, nothing ]) );
                    } else {
                        logoSquares.push( new GridSquare(0, gs*i, gs,
                            full) );
                    }
                } //end first column
                else if( j == 1 ) {
                    if( i == 0 || i == 3 ) {
                        logoSquares.push( new GridSquare(gs, gs*i, gs,
                            full));
                    } else {
                        logoSquares.push( new GridSquare(gs, gs*i, gs,
                            empty));
                    }
                } //end second column
                else if(j == 2) {
                    if(i == 0) {
                        logoSquares.push( new GridSquare(gs*2, gs*i, gs,
                            [nothing, nothing, logo, logo]));
                    }
                    else if(i == 1 || i == 2) {
                        logoSquares.push( new GridSquare(gs*2, gs*i, gs,
                            full));
                    }
                    else if(i == 3) {
                        logoSquares.push( new GridSquare(gs*2, gs*i, gs,
                            [logo, nothing, nothing, logo]));
                    }
                    else {
                        //transparent, but you can do nothing
                    }
                }//end third column
            }
        }

        //C1 and C2
        for(var i = 0; i < 7; i++) {
            for(var j = 0; j < 3; j++) {
                if( j == 0 ) {
                    if( i == 0 ) {
                        //first C
                        logoSquares.push( new GridSquare(gs*4, gs*i, gs,
                            [nothing, logo, logo, nothing]));
                        //second C
                        logoSquares.push( new GridSquare(gs*8, gs*i, gs,
                            [nothing, logo, logo, nothing]));
                    }
                    else if( i == 6 ) {
                        logoSquares.push( new GridSquare(gs*4, gs*i, gs,
                            [logo, logo, nothing, nothing]));
                        logoSquares.push( new GridSquare(gs*8, gs*i, gs,
                            [logo, logo, nothing, nothing]));
                    } else {
                        logoSquares.push( new GridSquare(gs*4, gs*i, gs,
                            full));
                        logoSquares.push( new GridSquare(gs*8, gs*i, gs,
                            full));
                    }
                } //end first column
                else if( j == 1 ) {
                    if( i == 0 || i == 6 ) {
                        logoSquares.push( new GridSquare(gs*5, gs*i, gs,
                            full));
                        logoSquares.push( new GridSquare(gs*9, gs*i, gs,
                            full));
                    }
                    // else if( i == 1 ) {
                    //     logoSquares.push( new GridSquare(gs*5, gs*i, gs,
                    //         [logo, logo, nothing, logo]));
                    //     logoSquares.push( new GridSquare(gs*9, gs*i, gs,
                    //         [logo, logo, nothing, logo]));
                    // }
                    // else if( i == 5 ) {
                    //     logoSquares.push( new GridSquare(gs*5, gs*i, gs,
                    //         [nothing, logo, logo, logo]));
                    //     logoSquares.push( new GridSquare(gs*9, gs*i, gs,
                    //         [nothing, logo, logo, logo]));
                    // }
                } //end second column
                else if( j == 2 ) {
                    if( i == 1 || i == 5 ) {
                        logoSquares.push( new GridSquare(gs*6, gs*i, gs,
                            full));
                        logoSquares.push( new GridSquare(gs*10, gs*i, gs,
                            full));
                    }
                    else if( i == 0 ) {
                        logoSquares.push( new GridSquare(gs*6, gs*i, gs,
                            [nothing, nothing, logo, logo]));
                        logoSquares.push( new GridSquare(gs*10, gs*i, gs,
                            [nothing, nothing, logo, logo]));
                    }
                    else if( i == 6) {
                        logoSquares.push( new GridSquare(gs*6, gs*i, gs,
                            [logo, nothing, nothing, logo]));
                        logoSquares.push( new GridSquare(gs*10, gs*i, gs,
                            [logo, nothing, nothing, logo]));                                
                    }
                }//end third column
            }
        }

    }

    function animate() {
        rafID = requestAnimationFrame(animate);
        var numRows = Math.round(ch / gs) + 1;
        var numCols = Math.round(cw / gs) + 1;
        ctx.clearRect(0,0,cw,ch);
        for(var i = 0; i < gridSquares.length; i++) {
            gridSquares[i].update();
            gridSquares[i].draw();
        }
        ctx.save();
        
        ctx.translate((gs*(Math.round(numCols/2))) - gs*Math.round(logoWidth/2) - gs, 
            (gs*Math.floor(numRows/2)) - gs*Math.floor(logoHeight/2) - gs);
        console.log('drawing logo');
        for(var i = 0; i < logoSquares.length; i++) {
            logoSquares[i].update();
            logoSquares[i].draw();
        }
        ctx.restore();
    }
    
    $(document).on('click', 'canvas', function() {
        //don't start animating if you're not done yet
        if(!allAnimationDone) { return; }
        allAnimationDone = false;

        //change the palette
        currentPalette++;
        if(currentPalette >= palettes.length) {
            currentPalette = 0;
        }
        $('canvas').css('background-color', palettes[currentPalette][0]);

        //request animation frame
        rafID = requestAnimationFrame(animate);

        //kick off animation with offset
        var gsAnimateClosure = function(squares, locali) {
            squares[locali].kickOffAnimation();
        }
        var sweepDirection;
        if(currentPalette % 2 === 0) {
            sweepDirection = "y";
        } else {
            sweepDirection = "x";
        }
        for(var i = 0; i < gridSquares.length; i++) {
            setTimeout(gsAnimateClosure, gridSquares[i][sweepDirection]/3, gridSquares, i);
            if(i < logoSquares.length) {
                setTimeout(gsAnimateClosure, logoSquares[i].x + gs*5, logoSquares, i);
            }
        }
    });

    $(window).on('resize', function(){
        if(rafID) {
            cancelAnimationFrame(rafID);
        }
        //reset variables
        cw = canvas.width = $(window).width();
        ch = canvas.height = 399;
        gridSquares = [];
        logoSquares = [];
        logoWidth = 0; //this gets set in whichever draw method you're using
        logoHeight = 0; //this gets set in whichever draw method you're using
        gs = 80;
        init();
    });

    function init() {
        //makeNewLogoGrid(logoSquares);
        makeOldLogoGrid(logoSquares);
        makeBackgroundGrid(gridSquares);
        
        //draw but not animate
        //this is just the animation function copied wholesale except for the recursive part
        var numRows = Math.round(ch / gs) + 1;
        var numCols = Math.round(cw / gs) + 1;
        ctx.clearRect(0,0,cw,ch);
        for(var i = 0; i < gridSquares.length; i++) {
            gridSquares[i].update();
            gridSquares[i].draw();
        }
        ctx.save();
        
        ctx.translate((gs*(Math.round(numCols/2))) - gs*Math.round(logoWidth/2) - gs, 
            (gs*Math.floor(numRows/2)) - gs*Math.floor(logoHeight/2) - gs);
        console.log('drawing logo');
        for(var i = 0; i < logoSquares.length; i++) {
            logoSquares[i].update();
            logoSquares[i].draw();
        }
        ctx.restore();
    }

    init();
})();