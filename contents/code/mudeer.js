// enum (0->No Fullscreen; 1->Fullscreen; 2->Fullscreen avoid panels)
var fullscreen_state = 0

// Calculate the window geometry given slots chosen and area
function getGeometry(area,slotGeometry){
	var width = Math.floor(area.width / slotGeometry.xSlots)
	var height = Math.floor(area.height / slotGeometry.ySlots)
	// adjust for remainder
	var xRemainder = area.width % slotGeometry.xSlots
	var yRemainder = area.height % slotGeometry.ySlots

	var x = area.x + (width*slotGeometry.x)
	var y = area.y + (height*slotGeometry.y)

	if (slotGeometry.x == slotGeometry.xSlots - 1) {
		width = width + xRemainder
	}
	if (slotGeometry.y == slotGeometry.ySlots - 1) {
		height = height + yRemainder
	}


	return { x:x, y:y, width:(width*slotGeometry.xSize), height:(height*slotGeometry.ySize)}
}

// Adjust for middle increase and gap
function adjustWidth(geometry,x,xSlots,xSize) {
	var midIncrease = readConfig("middleIncrease", 0)

	if (xSlots == 3) {
		var xShift = [0,-1,1]
		var widthShift = ((xSize <= 1) ? [-1,2,-1] : [1,1,1])

		geometry.x += xShift[x]*midIncrease
		geometry.width += widthShift[x]*midIncrease
	}
}

// Adjust for gaps
function adjustGap(geometry,x,xSlots,xSize,y,ySlots,ySize) {
	var gap = readConfig("gap", 0)
	var halfgap = Math.floor(gap / 2)

	geometry.x += halfgap
	geometry.y += halfgap
	geometry.width -= 2*halfgap
	geometry.height -= 2*halfgap

	if (x == 0) {
		geometry.x += halfgap
		geometry.width -= halfgap
	}
	if (y == 0) {
		geometry.y += halfgap
		geometry.height -= halfgap
	}
	if (x+xSize == xSlots) {
		geometry.width -= halfgap
	}
	if (y+ySize == ySlots) {
		geometry.height -= halfgap
	}
}

// main function called
// xSlots -> how many segments to split the x axis
// x -> starting slot starting with 0
// xSize -> how many slots to occupy on the xAxis
// yPos ->  (0:Full Height, 1: Top, 2: Bottom)
function move(workspace,xSlots,x,xSize, yPos) {
	var client = workspace.activeClient
	if (client.specialWindow) return;

	var maxArea =  workspace.clientArea(KWin.MaximizeArea, client)
	var fullArea = workspace.clientArea(KWin.FullScreenArea, client)
	var area = maxArea
	// Adjust for yPos (0:Full Height, 1: Top, 2: Bottom)
	var y = 0
	var ySlots = 1
	var ySize = 1
	if (yPos > 0) {
		ySlots = 2
		y = yPos - 1
	}

	// Handle the case of veritcal monitors
	if (fullArea.height > fullArea.width) {
		[x,xSlots,xSize,y,ySlots,ySize] = [y,ySlots,ySize,x,xSlots,xSize]
	}

	if (fullscreen_state > 0) {
		area = fullArea;
	}
	var geometry = getGeometry(area,{x:x,y:y,xSlots:xSlots,ySlots:ySlots,xSize:xSize,ySize:ySize});

	if (fullscreen_state == 0) {
		adjustGap(geometry,x,xSlots,xSize,y,ySlots,ySize);
		adjustWidth(geometry,x,xSlots,xSize);
		client.setMaximize(false,false);
	} else if (fullscreen_state == 2)  {
		if (geometry.y < maxArea.y ) {
			var diff = maxArea.y - geometry.y;
			geometry.y=maxArea.y;
			geometry.height -= diff;
		}
		if ((geometry.y + geometry.height) > (maxArea.y + maxArea.height)) {
			var diff = (geometry.y + geometry.height) - (maxArea.y + maxArea.height)
			geometry.height -= diff
		}
		if (geometry.x < maxArea.x ) {
			var diff = maxArea.x - geometry.x
			geometry.x=maxArea.x
			geometry.width -= diff
		}
		if ((geometry.x + geometry.width) > (maxArea.x + maxArea.width)) {
			var diff = (geometry.x + geometry.width) - (maxArea.x + maxArea.width)
			geometry.width -= diff
		}
	}
	client.fullScreen = (fullscreen_state == 1);
	client.geometry = geometry;

	// can implement toggle option to change fullscreen prefix behaviour
	var fs_toggle = false;
	if (!fs_toggle){
		fullscreen_state = 0;
	}
}


var prefix = "_Pac Mudeer Ultrawide: ";

/*
View by keyboard layout :


View by columns :
+---------------------------------------+     +------------+
|                   n                   |     |            |
+-------------+-----------+-------------+     |    Ctrl    |
|      i      |     o     |      p      |     |            |
+-------------+-----------+-------------+     +------------+
|            i!           |     ...     |     |            |
+-------------+-----------+-------------+     |    Alt     |
|     ...     |            p!           |     |            |
+-------------+-----+-------------------+     +------------+

+---------+-------------------+---------+
|         j!        |         m!        |
+---------+---------+---------+---------+

+---------+---------+---------+---------+
|    j    |    k    |    l    |    m    |
+---------+---------+---------+---------+
|              k!             |   ...   |
+---------+-------------------+---------+
|   ...   |              l!             |
+---------+-------------------+---------+
|   ...   |         o!        |   ...   |
+---------+---------+---------+---------+
*/

var letter1 = 'n'
var letter31 = 'i'
var letter32 = 'o'
var letter33 = 'p'
var letter41 = 'j'
var letter42 = 'k'
var letter43 = 'l'
var letter44 = 'm'

// Must pass 'workspace' since it would be out of scope otherwise

registerShortcut("Mudeer Fullscreen", prefix+"Fullscreen", "Meta+"+letter1, function () {
    fullscreen(workspace, 0, false)})

// Next 4 Shortcuts will be deprecated
registerShortcut("Mudeer Fullscreen Right", prefix+"Fullscreen Right Half", "Meta+Alt+"+letter1, function () {
	fullscreen_state = 1;
	move(workspace,2,1,1,0);
});
registerShortcut("Mudeer Fullscreen Left", prefix+"Fullscreen Left Half", "Meta+Ctrl+"+letter1, function () {
	fullscreen_state = 1;
	move(workspace,2,0,1,0);
});
registerShortcut("Mudeer Fullscreen Right Remainder", prefix+"Fullscreen Right Half Remainder", "Meta+Alt+Shift+"+letter1, function () {
	fullscreen_state = 2;
	move(workspace,2,1,1,0);
});
registerShortcut("Mudeer Fullscreen Left Remainder", prefix+"Fullscreen Left Half Remainder", "Meta+Ctrl+Shift+"+letter1, function () {
	fullscreen_state = 2;
	move(workspace,2,0,1,0);
});


registerShortcut("Mudeer Fullscreen Prefix", prefix+"Fullscreen Prefix", "Meta+Ctrl+f", function () {
	var fs_toggle = false;
	if  ( !fs_toggle || !(fullscreen_state == 1)) {
		fullscreen_state = 1;
	} else fullscreen_state = 0;
})
registerShortcut("Mudeer Fullscreen Prefix Avoid Panel", prefix+"Fullscreen Prefix avoid Panel", "Meta+Shift+Ctrl+f", function () {
	var fs_toggle = false;
	if  ( !fs_toggle || !(fullscreen_state == 2)) {
		fullscreen_state = 2;
	} else fullscreen_state = 0;
})



// Screen by Thirds
registerShortcut("Mudeer Left", prefix+"Third Left", "Meta+"+letter31, function () {
    move(workspace, 3,0,1,0)})
registerShortcut("Mudeer Center", prefix+"Third Center", "Meta+"+letter32, function () {
    move(workspace, 3,1,1,0)})
registerShortcut("Mudeer Right", prefix+"Third Right", "Meta+"+letter33, function () {
    move(workspace, 3,2,1,0)})

// Screen by Thirds TOP
registerShortcut("Mudeer Left Top", prefix+"Third Left Top", "Meta+Ctrl+"+letter31, function () {
    move(workspace, 3,0,1,1)})
registerShortcut("Mudeer Center Top", prefix+"Third Center Top", "Meta+Ctrl+"+letter32, function () {
    move(workspace, 3,1,1,1)})
registerShortcut("Mudeer Right Top", prefix+"Third Right Top", "Meta+Ctrl+"+letter33, function () {
    move(workspace, 3,2,1,1)})

// Screen by Thirds Bottom
registerShortcut("Mudeer Left Bottom", prefix+"Third Left Bottom", "Meta+Alt+"+letter31, function () {
    move(workspace, 3,0,1,2)})
registerShortcut("Mudeer Center Bottom", prefix+"Third Center Bottom", "Meta+Alt+"+letter32, function () {
    move(workspace, 3,1,1,2)})
registerShortcut("Mudeer Right Bottom", prefix+"Third Right Bottom", "Meta+Alt+"+letter33, function () {
    move(workspace, 3,2,1,2)})

// Screen by Multiple Thirds
registerShortcut("Mudeer Left Multi", prefix+"Two-Thirds Left", "Meta+Shift+"+letter31, function () {
    move(workspace, 3,0,2,0)})
registerShortcut("Mudeer Center Multi", prefix+"Middle Half", "Meta+Shift+"+letter32, function () {
    move(workspace, 4,1,2,0)})
registerShortcut("Mudeer Right Multi", prefix+"Two-Thirds Right", "Meta+Shift+"+letter33, function () {
    move(workspace, 3,1,2,0)})

// Screen by Multiple Thirds TOP
registerShortcut("Mudeer Left Multi Top", prefix+"Two-Thirds Left Top", "Meta+Shift+Ctrl+"+letter31, function () {
    move(workspace, 3,0,2,1)})
registerShortcut("Mudeer Center Multi Top", prefix+"Middle Half Top", "Meta+Shift+Ctrl+"+letter32, function () {
    move(workspace, 4,1,2,1)})
registerShortcut("Mudeer Right Multi Top", prefix+"Two-Thirds Right Top", "Meta+Shift+Ctrl+"+letter33, function () {
    move(workspace, 3,1,2,1)})

// Screen by Multiple Thirds Bottom
registerShortcut("Mudeer Left Multi Bottom", prefix+"Two-Thirds Left Bottom", "Meta+Shift+Alt+"+letter31, function () {
    move(workspace, 3,0,2,2)})
registerShortcut("Mudeer Center Multi Bottom", prefix+"Middle Half Bottom", "Meta+Shift+Alt+"+letter32, function () {
    move(workspace, 4,1,2,2)})
registerShortcut("Mudeer Right Multi Bottom", prefix+"Two-Thirds Right Bottom", "Meta+Shift+Alt+"+letter33, function () {
    move(workspace, 3,1,2,2)})

// Screen By Quarters
registerShortcut("Mudeer Far Left", prefix+"Quarter Far Left", "Meta+"+letter41, function () {
    move(workspace, 4,0,1,0)})
registerShortcut("Mudeer Center Left", prefix+"Quarter Center Left", "Meta+"+letter42, function () {
    move(workspace, 4,1,1,0)})
registerShortcut("Mudeer Center Right", prefix+"Quarter Center Right", "Meta+"+letter43, function () {
    move(workspace, 4,2,1,0)})
registerShortcut("Mudeer Far Right", prefix+"Quarter Far Right", "Meta+"+letter44, function () {
    move(workspace, 4,3,1,0)})

// Screen By Quarters Top
registerShortcut("Mudeer Far Left Top", prefix+"Quarter Far Left Top", "Meta+Ctrl+"+letter41, function () {
    move(workspace, 4,0,1,1)})
registerShortcut("Mudeer Center Left Top", prefix+"Quarter Center Left Top", "Meta+Ctrl+"+letter42, function () {
    move(workspace, 4,1,1,1)})
registerShortcut("Mudeer Center Right Top", prefix+"Quarter Center Right Top", "Meta+Ctrl+"+letter43, function () {
    move(workspace, 4,2,1,1)})
registerShortcut("Mudeer Far Right Top", prefix+"Quarter Far Right Top", "Meta+Ctrl+"+letter44, function () {
    move(workspace, 4,3,1,1)})

// Screen By Quarters Bottom
registerShortcut("Mudeer Far Bottom", prefix+"Quarter Far Left Bottom", "Meta+Alt+"+letter41, function () {
    move(workspace, 4,0,1,2)})
registerShortcut("Mudeer Center Left Bottom", prefix+"Quarter Center Left Bottom", "Meta+Alt+"+letter42, function () {
    move(workspace, 4,1,1,2)})
registerShortcut("Mudeer Center Right Bottom", prefix+"Quarter Center Right Bottom", "Meta+Alt+"+letter43, function () {
    move(workspace, 4,2,1,2)})
registerShortcut("Mudeer Far Right Bottom", prefix+"Quarter Far Right Bottom", "Meta+Alt+"+letter44, function () {
    move(workspace, 4,3,1,2)})

// Screen By Multiple Quarters
registerShortcut("Mudeer Half Left", prefix+"Half Left", "Meta+Shift+"+letter41, function () {
    move(workspace, 4,0,2,0)})
registerShortcut("Mudeer Three-Quarters Left", prefix+"Three-Quarters Left", "Meta+Shift+"+letter42, function () {
    move(workspace, 4,0,3,0)})
registerShortcut("Mudeer Three-Quarters Right", prefix+"Three-Quarters Right", "Meta+Shift+"+letter43, function () {
    move(workspace, 4,1,3,0)})
registerShortcut("Mudeer Half Right", prefix+"Half Right", "Meta+Shift+"+letter44, function () {
    move(workspace, 4,2,2,0)})

// Screen By Multiple Quarters Top
registerShortcut("Mudeer Half Left Top", prefix+"Half Left Top", "Meta+Shift+Ctrl+"+letter41, function () {
    move(workspace, 4,0,2,1)})
registerShortcut("Mudeer Three-Quarters Left Top", prefix+"Three-Quarters Left Top", "Meta+Shift+Ctrl+"+letter42, function () {
    move(workspace, 4,0,3,1)})
registerShortcut("Mudeer Three-Quarters Right Top", prefix+"Three-Quarters Right Top", "Meta+Shift+Ctrl+"+letter43, function () {
    move(workspace, 4,1,3,1)})
registerShortcut("Mudeer Half Right Top", prefix+"Half Right Top", "Meta+Shift+Ctrl+"+letter44, function () {
    move(workspace, 4,2,2,1)})

// Screen By Multiple Quarters Bottom
registerShortcut("Mudeer Half Left Bottom", prefix+"Half Left Bottom", "Meta+Shift+Alt+"+letter41, function () {
    move(workspace, 4,0,2,2)})
registerShortcut("Mudeer Three-Quarters Left Bottom", prefix+"Three-Quarters Left Bottom", "Meta+Shift+Alt+"+letter42, function () {
    move(workspace, 4,0,3,2)})
registerShortcut("Mudeer Three-Quarters Right Bottom", prefix+"Three-Quarters Right Bottom", "Meta+Shift+Alt+"+letter43, function () {
    move(workspace, 4,1,3,2)})
registerShortcut("Mudeer Half Right Bottom", prefix+"Half Right Bottom", "Meta+Shift+Alt+"+letter44, function () {
    move(workspace, 4,2,2,2)})