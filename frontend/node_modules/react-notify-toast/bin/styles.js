'use strict';

Object.defineProperty(exports, "__esModule", {
      value: true
});

var _defaults = require('./defaults');

var styles = {
      container: {
            position: 'fixed',
            width: '50%',
            margin: '0 auto',
            right: '0px',
            top: '-100px',
            left: '0px',
            textAlign: 'center',
            zIndex: _defaults.defaults.zIndex,
            pointerEvents: 'none',
            transition: 'all ' + _defaults.defaults.animationDuration + 'ms ease',
            transform: 'translateY(0px)',

            // Vendor Prefixes
            msTransition: 'all ' + _defaults.defaults.animationDuration + 'ms ease',
            msTransform: 'translateY(0px)',
            WebkitTransition: 'all ' + _defaults.defaults.animationDuration + 'ms ease',
            WebkitTransform: 'translateY(0px)',
            OTransition: 'all ' + _defaults.defaults.animationDuration + 'ms ease',
            OTransform: 'translateY(0px)',
            MozTransition: 'all ' + _defaults.defaults.animationDuration + 'ms ease',
            MozTransform: 'translateY(0px)'
      },
      content: {
            cursor: 'pointer',
            display: 'inline',
            width: 'auto',
            borderRadius: '0 0 4px 4px',
            backgroundColor: 'white',
            padding: '10px 30px',
            pointerEvents: 'all'
      },
      show: {
            transform: 'translateY(108px)',
            msTransform: 'translateY(108px)',
            WebkitTransform: 'translateY(108px)',
            OTransform: 'translateY(108px)',
            MozTransform: 'translateY(108px)'
      },
      hide: {
            transform: 'translateY(-108px)',
            msTransform: 'translateY(-108px)',
            WebkitTransform: 'translateY(-108px)',
            OTransform: 'translateY(-108px)',
            MozTransform: 'translateY(-108px)'
      }
};

exports.default = styles;