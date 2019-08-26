var colors = ["blue", "limegreen", "orange", "red", "purple", "cyan", "gold", "black"];

var mine = "\u25C9";

function Board(){
	table.parentElement.addEventListener("contextmenu", function(e){e.preventDefault();});
	
	this.mines = [[0]];
	this.mTotal = 0;
	this.mChecked = 0;
	
	this.boardDim = [1, 1];
	this.checked = 0;
	
	this.time = 0;
	this.clock = -1;
	
	this.running = false;
	this.started = false;
	
}

Board.prototype = {
	
	//Second
	
	sec: function(){
		this.time++;
		sTime.textContent = this.time;
	},
	
	//Game states
	
	win: function(){
		if(!this.running) return;
		this.running = false;
		clearInterval(this.clock);
		this.clock = -1;
		circle.className = "win";
		
		this.revealMines("#08d");
	},
	
	lose: function(x, y){
		if(!this.running) return;
		this.running = false;
		clearInterval(this.clock);
		this.clock = -1;
		circle.className = "lose";
		
		this.revealMines("black");
		
		this.getMineEl(x, y).style.color = "red";
	},
	
	revealMines: function(color){
		let lp = this.mines.length;
		for(let i = 0; i < lp; i++){
			let lp2 = this.mines[i].length;
			for(let j = 0; j < lp2; j++){
				let e = this.getMineEl(this.mines[i][j], i);
				e.style.color = color;
				e.textContent = mine;
			}
		}
	},
	
	closeToStart: function(x, y, sx, sy){
		let length = Math.sqrt((x-sx)*(x-sx) + (y-sy)*(y-sy));
		if(length <  1.5) return true;
		return false;
	},
	
	replaceMine: function(x, y, sx, sy){
		let flag = false;
		if(!this.isMine(x, y)) return;
		while(!flag){
			for(let i = 0; i < this.boardDim[1] && !flag; i++){
				for(let j = 0; j < this.boardDim[0] && !flag; j++){
					if(!this.isMine(j, i) && !this.closeToStart(j, i, sx, sy) && Math.floor(Math.random()*4) == 0){
						this.mines[i].push(j);
						flag = true;
					}
				}
			}
		}
		this.mines[y].splice(this.mines[y].indexOf(x), 1);
	},
	
	start: function(x, y){
		this.started = true;
		
		let dx = x;
		this.replaceMine(dx, y, x, y);
		this.replaceMine(dx, y+1, x, y);
		this.replaceMine(dx, y-1, x, y);
		dx++;
		this.replaceMine(dx, y, x, y);
		this.replaceMine(dx, y+1, x, y);
		this.replaceMine(dx, y-1, x, y);
		dx -= 2;
		this.replaceMine(dx, y, x, y);
		this.replaceMine(dx, y+1, x, y);
		this.replaceMine(dx, y-1, x, y);
		
		this.clock = setInterval(this.sec.bind(this), 1000);
	},
	
	//Event managers
	
	click: function(e){
		let el = e.target;
		var x = parseInt(el.getAttribute("x")), y = parseInt(el.getAttribute("y"));
		
		if(!this.running || el.textContent !== " " || el.classList.contains("chkd")) return;
		
		if(!this.started){
			this.start(x, y);
		}
		
		if(this.isMine(x, y)){
			this.lose(x, y);
			return;
		}
		
		this.check(x, y);
	},
	
	ctxMenu: function(e){
		let el = e.target;
		var x = parseInt(el.getAttribute("x")), y = parseInt(el.getAttribute("y"));
		
		if(el.classList.contains("chkd") || !this.running || !this.started) {
			e.preventDefault();
			return;
		}
		
		if(el.textContent == "!"){
			
			el.textContent = "?";
			this.mChecked--;
		}else if(el.textContent == "?"){
			
			el.textContent = " ";
		}else{
			
			el.textContent = "!";
			this.mChecked++;
		}
		sMines.textContent = this.mTotal - this.mChecked;
		e.preventDefault();
	},
	
	//Recognizing the click
	
	isMine: function(x, y){
		if(y >= this.mines.length || y < 0) return false;
		return this.mines[y].includes(x);
	},
	
	isChecked: function(x, y){
		if(y >= this.boardDim[1] || y < 0) return true;
		if(x >= this.boardDim[0] || x < 0) return true;
		return table.children[y].children[x].className == "chkd";
	},
	
	numAround: function(x, y){
		let m = 0;let dx = x;
		if(this.isMine(dx, y+1)) m++;
		if(this.isMine(dx, y-1)) m++;
		dx = x+1;
		if(this.isMine(dx, y)) m++;
		if(this.isMine(dx, y+1)) m++;
		if(this.isMine(dx, y-1)) m++;
		dx = x-1;
		if(this.isMine(dx, y)) m++;
		if(this.isMine(dx, y+1)) m++;
		if(this.isMine(dx, y-1)) m++;
		return m;
	},
	
	getMineEl: function(x, y){
		return table.children[y].children[x];
	},
	
	check: function(x, y){
		if(!this.running) return;
		
		let n = this.numAround(x, y);
		let e = this.getMineEl(x, y);
		
		if(e.textContent == "!") return;
		
		e.className = "chkd";
		
		if(n !== 0){
			
			e.style.color = colors[n-1];
			e.textContent = n;
		}else{
			
			this.findPath(x, y);
		}
		
		this.checked++;
		if(this.checked == (this.boardDim[0]*this.boardDim[1] - this.mTotal)) this.win();
	},
	
	findPath: function(x, y){
		let dx = x;
		if(!this.isChecked(dx, y+1)) this.check(dx, y+1);
		if(!this.isChecked(dx, y-1)) this.check(dx, y-1);
		dx = x+1;
		if(!this.isChecked(dx, y+1)) this.check(dx, y+1);
		if(!this.isChecked(dx, y-1)) this.check(dx, y-1);
		if(!this.isChecked(dx, y)) this.check(dx, y);
		dx = x-1;
		if(!this.isChecked(dx, y+1)) this.check(dx, y+1);
		if(!this.isChecked(dx, y-1)) this.check(dx, y-1);
		if(!this.isChecked(dx, y)) this.check(dx, y);
	},
	
	//Managing the board
	
	reset: function(){
		setTimeout(this.loading(), 10);
		setTimeout(this.setup.bind(this), 100);
	},
	
	loading: function(){
		circle.className = "loading";
	},
	
	setup: function(){
		let x = xIn.value;
		let y = yIn.value;
		
		let mines = mIn.value;
		
		if(parseFloat(dIn.value) !== 0) mines = Math.round(x*y*parseFloat(dIn.value));
		
		if(x <= 3 && y <= 3){
			circle.className = "lose";
			alert("Board size too small!");
			return;
		}else if(mines > x*y-9) {
			circle.className = "lose";
			alert("Too many mines selected!");
			return;
		}
		
		this.started = false;
		
		this.boardDim = [x, y];
		
		while(table.firstChild){
			table.firstChild.remove();
		}
		
		this.mTotal = mines;
		this.mChecked = 0;
		this.mines = [];
		
		this.checked = 0;
		
		sMines.textContent = mines;
		
		this.time = 0;
		sTime.textContent = this.time;
		if(this.clock !== -1) clearInterval(this.clock);
		this.clock = -1;
		
		let mRarity = x*y*0.8;
		
		for(let i = 0; i < y; i++){
			
			let row = document.createElement("tr");
			
			this.mines.push([]);
			
			for(let j = 0; j < x; j++){
				
				let cell = document.createElement("td");
				cell.textContent = " ";
				cell.setAttribute("x", j);
				cell.setAttribute("y", i);
				cell.classList = ["wt"];
				cell.addEventListener("click", this.click.bind(this));
				cell.addEventListener("contextmenu", this.ctxMenu.bind(this));
				row.appendChild(cell);
				
				if(mines > 0 && Math.floor(Math.random()*mRarity) == 0){
					this.mines[i].push(j);
					mines--;
				}
			}
			
			table.appendChild(row);
		}
		
		while(mines > 0){
			for(let i = 0; i < y; i++){
				if(mines <= 0) break;
				for(let j = 0; j < x; j++){
					if(mines <= 0) break;
					if(!this.isMine(j, i) && Math.floor(Math.random()*mRarity) == 0){
						this.mines[i].push(j);
						mines--;
					}
				}
			}
		}
		
		circle.className = "ingame";
		this.running = true;
	},
	
	// Loading a previously saved game
	
	getSaveData: function(){
		var data = {};
		
		data.mines = this.mines;
		data.mTotal = this.mTotal;
		data.checked = this.checked;
		data.time = this.time;
		
		var boardState = [];
		
		for(var i = 0; i < table.children.length; i++){
			boardState.push([]);
			let row = table.children[i];
			for(var j = 0; j < row.children.length; j++){
				if(row.children[j].textContent == " "){
					if(row.children[j].classList.contains("chkd")) boardState[i].push("0");
					else boardState[i].push(" ");
				}else boardState[i].push(row.children[j].textContent);
			}
		}
		
		data.boardState = boardState;
		
		return data;
	},
	
	loadSaveData: function(e){
		if(this.clock !== -1) clearInterval(this.clock);
		this.clock = -1;
		
		var data;
		
		try{
			data = JSON.parse(e.target.result);
		}catch(err){
			this.loadError(err);
			return;
		}
		
		while(table.firstChild){
			table.firstChild.remove();
		}
		
		this.mines = data.mines;
		this.mTotal = data.mTotal;
		this.mChecked = 0;
		
		this.boardDim = [data.boardState[0].length, data.boardState.length];
		this.checked = data.checked;
		
		this.time = data.time;
		
		var finFlag = false;
		
		for(let i = 0; i < data.boardState.length; i++){
			
			let row = document.createElement("tr");
			
			this.mines.push([]);
			
			for(let j = 0; j < data.boardState[0].length; j++){
				
				let cell = document.createElement("td");
				cell.classList = ["wt"];
				
				switch(data.boardState[i][j]){
					case mine:
						finFlag = true;
					case "!":
						this.mChecked++;
					default:
						cell.textContent = data.boardState[i][j];
						let n = parseInt(data.boardState[i][j]);
						if(!isNaN(n)){
							cell.style.color = colors[n-1];
							cell.className = "chkd";
						}
						break;
						
					case "0":
						cell.className = "chkd";
						cell.textContent = " ";
						break;
				}
				
				cell.setAttribute("x", j);
				cell.setAttribute("y", i);
				
				cell.addEventListener("click", this.click.bind(this));
				cell.addEventListener("contextmenu", this.ctxMenu.bind(this));
				row.appendChild(cell);
				
				if(mines > 0 && Math.floor(Math.random()*mRarity) == 0){
					this.mines[i].push(j);
					mines--;
				}
			}
			
			table.appendChild(row);
		}
		
		sMines.textContent = this.mTotal - this.mChecked;
		sTime.textContent = this.time;
		
		this.clock = setInterval(this.sec.bind(this), 1000);
		
		circle.className = "ingame";
		
		this.running = true;
		this.started = true;
		
		if(finFlag){
			if(this.checked == (this.boardDim[0]*this.boardDim[1] - this.mTotal)) this.win();
			else this.lose();
		}
	},
	
	loadError: function(err){
		alert("Error loading previously saved game!\nCheck the console for more info.");
		throw err;
	},
	
	save: function(){
		if(!this.started){
			alert("Start a game to save it!");
			return;
		}
		var dat = this.getSaveData();
		download(JSON.stringify(dat), "MinesSave.mgs", "text/plain");
	},
	
	loadFromFile: function(){
		if(this.running){
			this.running = false;
			clearInterval(this.clock);
			this.clock = -1;
			circle.className = "loading";
		}
		
		if(fileSel.files.length < 1){
			alert("No file selected!");
			return;
		}
		var file = fileSel.files[0];
		var fr = new FileReader();
		fr.addEventListener("load", this.loadSaveData.bind(this));
		fr.addEventListener("error", this.loadError);
		
		fr.readAsText(file);
	}
};

//Taken from Kanchu on Sack Overflow
//Reference: https://stackoverflow.com/questions/13405129/javascript-create-and-save-file
function download(data, filename, type) {
	var file = new Blob([data], {type: type});
	if (window.navigator.msSaveOrOpenBlob) // IE10+
		window.navigator.msSaveOrOpenBlob(file, filename);
	else { // Others
		var a = document.createElement("a"),
				url = URL.createObjectURL(file);
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		setTimeout(function() {
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);  
		}, 0); 
	}
}
