class Word {
    constructor (element) {
      this.element = element;
      if (element.classList.contains("slide-word-warm")) {
        this.colors = ['#DB504A', '#FF6F59'];
        this.tops = ['#E47A77', '#FF9585'];
      }
      else if (element.classList.contains("slide-word-cool")) {
        this.colors = ['#05668D', '#028090']//, '#00A896'];
        this.tops = ['#078FC5', '#03B2C9']//,  '#00E0CA'];
      }
      else {
        this.colors = ['#02C39A', '#00A896'];
        this.tops = ['#02F2BE', '#00E0CA'];
      }
      
      this.init()
    }
    
    init() {
      this.letters = [];
      this.layers = 1;
      
      this.wordString = this.element.innerText
      this.element.innerHTML = '';
      this.element.setAttribute('aria-label', this.wordString)
      
      const letterStrings = this.wordString.split('');
      const style = getComputedStyle(this.element);
      this.layers = Number(style.getPropertyValue('--layers'));
      
      this.letters = letterStrings.map((letter, i) => new Letter(letter, this.layers, this.element, i, letterStrings.length))
      
      const animation = this.element.dataset.animation;
      if(animation && animations[animation]) animations[animation](this)
    }
    
    reset() {
      this.init()
    }
    
    onResize() {
      this.element.style.setProperty("--width", this.element.clientWidth);
      this.element.style.setProperty("--height", this.element.clientHeight);
      this.letters.forEach(letter => letter.resize())
    }
  }
  
  class Letter {
    constructor(letterString, count, container, index, total) {
      this.container = container
      this.character = letterString;
      this.mainElement = null;
      this.position = { x: 0, y: 0 };
      this.elements = [];
      this.index = index;
      
      this.createLayers(count)
    }
    
    createLayers(count) {
      for(let i = 0; i < count; i++) {
  
        const layer = i;
  
        const span = document.createElement('span')
        span.setAttribute('aria-hidden', true)
        span.classList.add('slide-letter')
        span.classList.add(i == 0 ? 'front' : 'under')
        if(i) span.setAttribute('contenteditable', false)
        if(i == count - 1) span.classList.add('back')
        span.innerHTML = this.character === ' ' ? '&nbsp;' : this.character;
        span.dataset['depth'] = layer;
        span.dataset['index'] = this.index;
        span.style.setProperty("--layer", count - layer);
        span.style.setProperty("--centerOffset", (layer - (count - 1) * 0.5 ) / ((count - 1) * 0.5) );
       
        this.elements.push(span)
  
        if(i === 0) {
          this.mainElement = span;
        }
  
        this.container.appendChild(span)
      }
    }
    
    resize() {
      const x = this.mainElement.offsetLeft
        
      this.elements.forEach(span => {
        span.style.setProperty("--xPos", x);
      })
    }
  }
  
  // Animations
  
  const animations = {
   
    slide: (word) => {
      const tl = gsap.timeline({

        defaults : {
          ease: 'power4.out',
          duration: 1
        }
      });
      let count = 0;
      word.letters.forEach((letter, i) => {
        letter.elements.forEach((layer, j) => {
          let isBottom = false;
          let color = word.colors[count % word.colors.length];
          if (j == 0) color = word.tops[count % word.tops.length];
          if(j == letter.elements.length - 1) {
            color = '#022B3B';
            isBottom = true;
          }
          const delay = 0.05 * i;
          
          tl.to(layer, {       
            delay,
            color: color,
            duration: i == 0 ? 1 : 0.05
          }, 0)
          
          tl.to(layer, {
            '--depth': 50, 
            '--z': isBottom ? 40 : 60,         
            delay
          }, 0)
        })
        if(letter.character !== ' ') count++;
      })
    }
  }
  
  // Create words

  export function animateTitleTop() {
    const words = [...document.querySelectorAll('.slide-word-top')].map(element => new Word(element))
    // Resize
    
    const onResize = () => {
      words.forEach(word => word.onResize())
    }
    //setTimeout(() => onResize(), 1000)
    onResize();
    //onResize()
    window.addEventListener('resize', () => onResize())
  }

  export function animateTitleBottom() {
    const words = [...document.querySelectorAll('.slide-word-bottom')].map(element => new Word(element))
    // Resize
    
    const onResize = () => {
      words.forEach(word => word.onResize())
    }
    //setTimeout(() => onResize(), 1000)
    onResize();
    //onResize()
    window.addEventListener('resize', () => onResize())
  }

  export function animateButtons() {
    //const buttons = [...document.querySelectorAll('.big-action-button')].map(element => new Button(element))
  }
  
