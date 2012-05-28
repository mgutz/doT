# doT

Created in search of the fastest and concise JavaScript templating function with emphasis on performance under V8 and nodejs. It shows great performance for both nodejs and browsers.

doT.js is fast, small and has no dependencies.

See [jsperf benchmarks](http://jsperf.com/hadlebars-vs-hogan-vs-mustache/2)
for a more fair comparison (encodes HTML values).

## Features

custom delimiters
runtime evaluation
runtime interpolation
compile-time evaluation
partials support
conditionals support
array iterators
object iterators
encoding
control whitespace - strip or preserve
streaming friendly
use it as logic-less or with logic, it is up to you

[original doT playground](http://olado.github.com/doT)

## Differences

I created this fork for two reasons:

1. doT templates are hard as heck to debug.
2. No comment feature.

To get meaningful errors, set `dot.templateSettings`

    { append: false, strip: false }

## New Features

CoffeeScript blocks (most logic should stay outside of template).

    {{`cs
        a = it?.prop || 'default'
    }}

Object iterator

    {{. anObject :value :key }}
        {{=key}} = {{=value}}
    {{.}}

Comments

    {{-- This is a comment }}


## License
* doT is an open source component of http://bebedo.com
* doT is licensed under the MIT License. (See LICENSE-DOT)
