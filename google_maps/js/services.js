var MyApp = angular.module('MyApp',[],function($provide, $filterProvider){
    
    // handy widgets functions
    // by https://github.com/twarogowski/angular-contrib/blob/master/js/angular-widgets.js
    /* some helpers for ui:map widget and other widgets */
    $provide.factory('widgetUtils',function($parse){
        var helpers =  function(){
            this.highlight = function(term, text){
                    if(!text)
                        return null;
                    var rx = new RegExp("("+$.ui.autocomplete.escapeRegex(term)+")", "ig" );
                    return text.replace(rx, "<strong>$1</strong>");
                };
                this.noHighlight = function(term, text){
                    return text;
                };
                this.getOptions = function (el, defaults, attrName){
                    attrName = attrName || 'ui:options';
                    var opts = $(el).attr(attrName);
                    defaults = defaults || {};
                    if(!opts)
                        return defaults;
                    var options = angular.fromJson('['+opts+']')[0];	
                    return $.extend(defaults, options);
                };
                this.parseExpr = function(val){
                    if(!val || val=='')
                        return null;
                    var expr = {
                        formatters:[]
                    };
                    var pts = val.split('|');
                    expr.expression = pts[0];
                    if(pts.length==1)
                        return expr;
                    for (var i = 0; i < pts.length; i++){
                        var args = pts[i].split(':');
                        var name = args.shift();
                        var frmt = angular.formatter[name];
                        if(frmt)
                            expr.formatters.push({
                                name: name, 
                                parse: frmt.parse, 
                                format: frmt.format, 
                                arguments: args
                            });
                    }
                    return expr;
                }
                
                this.parseAttrExpr = function (el, attrName){
                    if(!attrName)
                        return null;
                    var attr = $(el).attr(attrName);
                    return this.parseExpr(attr);	
                }
                
                this.setValue = function (scope, attrExpr, value){
                    if(!attrExpr || !attrExpr.expression)
                        return;
                    var v = value;
                    v = this.parseValue(v, attrExpr, scope);	
                    // WAS IN 09.19:
                    //scope.$set(attrExpr.expression, v);
                    // NOW IN 10.6. CHANGED BY MYSELF:
                    //scope.$apply(scope[attrExpr.expression] = v);
                    console.log('set value',attrExpr.expression,scope,v);
                    $parse(attrExpr.expression).assign(scope, v);
        
                }
                
                this.getValue = function (scope, attrExpr){
                    console.log('get value - scope',scope,attrExpr);
                    if(!attrExpr || !attrExpr.expression)
                        return null;
                    // WAS IN 09.19: 
                    // val = scope.$get(attrExpr.expression);
                    // NOW CHANGE FOR 10.6:
                    var val = scope[attrExpr.expression];
                    val = this.formatValue(val, attrExpr, scope);
                    return val;
                }
                this.parseValue= function (value, attrExpr, scope){
                    if(!attrExpr || !attrExpr.formatters || attrExpr.formatters.length==0)
                        return value;
                    var v = value;	
                    for (var i = 0; i < attrExpr.formatters.length; i++) {
                        var fm = attrExpr.formatters[i];
                        if(fm && fm.parse)
                            v = fm.parse.apply(scope, [v].concat(fm.arguments));
                    };
                    return v;	
                }
                this.formatValue = function (value, attrExpr, scope){
                    if(!attrExpr || !attrExpr.formatters || attrExpr.formatters.length==0)
                        return value;
                    var v = value;	
                    for (var i = 0; i < attrExpr.formatters.length; i++) {
                        var fm = attrExpr.formatters[i];
                        if(fm && fm.format)
                            v = fm.format.apply(scope, [v].concat(fm.arguments));
                    };
                    return v;
                }
                
                
            };
            
            return new helpers();
    });
    
});