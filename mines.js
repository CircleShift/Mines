var colors = ["blue", "limegreen", "orange", "red", "purple", "cyan", "gold", "black"];

var mine = "\u25C9";

function Board(){
	this.sMines = document.getElementById("mines");
	this.sTime = document.getElementById("time");
	
	this.circle = document.getElementById("circle");
	
	this.table = document.getElementById("gtable");
	this.table.parentElement.addEventListener("contextmenu", function(e){e.preventDefault();});
	
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
		let c = parseInt(this.sTime.textContent);
		c++;
		this.sTime.textContent = c;
	},
	
	//Game states
	
	win: function(){
		this.running = false;
		clearInterval(this.clock);
		this.clock = -1;
		this.circle.className = "win";
		
		this.revealMines("#08d");
	},
	
	lose: function(x, y){
		this.running = false;
		clearInterval(this.clock);
		this.clock = -1;
		this.circle.className = "lose";
		
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
	
	start: function(x, y){
		this.started = true;
		let flag = false;
		if(this.isMine(x, y)){
			for(let i = 0; i < this.boardDim[1] && !flag; i++){
				for(let j = 0; j < this.boardDim[0] && !flag; j++){
					if(!this.isMine(j, i)){
						this.mines[i].push(j);
						flag = true;
					}
				}
			}
			this.mines[y].splice(this.mines[y].indexOf(x), 1);
		}
	},
	
	//Event managers
	
	click: function(e){
		let el = e.target;
		var x = parseInt(el.getAttribute("x")), y = parseInt(el.getAttribute("y"));
		
		if(!this.running || el.textContent !== "" || el.classList.contains("chkd")) return;
		
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
			
			el.textContent = "";
		}else{
			
			el.textContent = "!";
			this.mChecked++;
		}
		this.sMines.textContent = this.mTotal - this.mChecked;
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
		return this.table.children[y].children[x].className == "chkd";
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
		return this.table.children[y].children[x];
	},
	
	check: function(x, y){
		if(!this.running) return;
		
		let n = this.numAround(x, y);
		let e = this.getMineEl(x, y);
		
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
		this.circle.className = "loading";
		
		let x = xIn.value;
		let y = yIn.value;
		let mines = mIn.value;
		
		if(mines >= x*y-1) {
			this.circle.className = "lose";
			return;
		}
		
		this.started = false;
		
		this.boardDim = [x, y];
		
		while(this.table.firstChild){
			this.table.firstChild.remove();
		}
		
		this.mTotal = mines;
		this.mChecked = 0;
		this.mines = [];
		this.checked = 0;
		this.sMines.textContent = mines;
		
		this.sTime.textContent = 0;
		if(this.clock !== -1) clearInterval(this.clock);
		this.clock = -1;
		
		let mRarity = x*y*0.8;
		
		for(let i = 0; i < y; i++){
			
			let row = document.createElement("tr");
			
			this.mines.push([]);
			
			for(let j = 0; j < x; j++){
				
				let cell = document.createElement("td");
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
			
			this.table.appendChild(row);
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
		
		this.circle.className = "ingame";
		this.running = true;
		this.clock = setInterval(this.sec.bind(this), 1000);
	}
};