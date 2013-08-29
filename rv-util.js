/* Robert's Utilities!
*
* These are a set of utility functions that I use all the damn time.
* Documentation forthcoming.
* 
*
* © Robert Vinluan, 2013
*/

(function(){
	var ro = {};

	/* Map
	*
	* Given a value and a range,
	* maps that value into a second range.
	* 
	* returns the corresponding value in the second range.
	*
    * 
    * 
	*/
	ro.map = function(value, start1, stop1, start2, stop2) {
	    if(value < start1) {
	        return start2;
	    } else if (value > stop1) {
	        return stop2;
	    }

	    //figure out how wide each range is
	    var range1 = stop1 - start1;
	    var range2 = stop2 - start2;

	    //find value in between 0 and 1
	    var normalizedValue = (value - start1) / range1;

	    //convert into range2
	    return start2 + (normalizedValue * range2);
    }

    /* Distance
    *
    * Find the distance between two points.
    * 
    */
    ro.dist = function(x1, y1, x2, y2) {
        var x = Math.abs(x1 - x2);
        var y = Math.abs(y1 - y2);
        return Math.sqrt((x*x) + (y*y));
    }

    /* Random
    *
    * returns a random number between 0 and max,
    * or given two arguments, a random number between min and max.
    * 
    */
    ro.random = function(min, max) {
    	if(arguments.length === 0) {
    		return Math.random();
    	} else if(arguments.length === 1) {
	        return Math.random() * min;
	    } else {
	        return min + (Math.random() * (max - min));
	    }
    }

    /* ToRadians
    *
    * converts from degrees to radians.
    *
    */
    ro.toRad = function(deg) {
    	return deg * ( Math.PI / 180);
    }

    /* Same
    *
    * returns true if all arguments strictly equal each other
    * 
    */
    ro.same = function() {
    	for(var i = 0; i < arguments.length - 1; i++) {
    		if(arguments[i] !== arguments[i+1]) {
    			return false;
    		}
    	}
    	return true;
    }

    /* MoveValueTowards
    *
    * moves a value towards another value by 1
    *
    */
    ro.moveValueTowards = function(val1, val2) {
    	var dist = Math.abs(val1 - val2);
    	if(val1 === val2 || dist <= 1 ) {
    		return val2;
    	} else if(val1 < val2) {
    		return val1 + 5;
    	} else {
    		return val1 - 5;
    	}
    }

    /* Any
    *
    * returns true if test matches any element in the array
    * 
    * 
    *
    *
    */
    ro.any = function(test, array) {
        for(i in array) {
            if(array[i] === test) {
                return true;
            }
        }
        return false;
    }

	window.rvutil = ro;
})();