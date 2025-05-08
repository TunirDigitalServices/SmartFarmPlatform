module.exports = {
    formate: 'A4',
    orientation: 'portrait',
    // default is 0, units: mm, cm, in, px 
    "border": {
        "top": "0",            
        "right": "0",
        "bottom": "0",
        "left": "0"
     },
     footer: {
        height: "10mm",
        contents: {
            first: '',
            2: '',
            3:'<span style="color: #444;">Page {{page}}</span>',
            4:'<span style="color: #444;">Page {{page}}</span>',
            5:'<span style="color: #444;">Page {{page}}</span>',
            6:'<span style="color: #444;">Page {{page}}</span>',
            7:'<span style="color: #444;">Page {{page}}</span>'
            // default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
        }
    }
}