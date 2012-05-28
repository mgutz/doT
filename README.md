# doT

Created in search of the fastest and concise JavaScript templating function with emphasis on performance under V8 and nodejs. It shows great performance for both nodejs and browsers.

doT.js is fast, small and has no dependencies.

See [jsperf benchmarks](http://jsperf.com/hadlebars-vs-hogan-vs-mustache/2)
for an equal playground (encodes HTML values) comparison.

## Features

* custom delimiters
* runtime evaluation
* runtime interpolation
* compile-time evaluation
* partials support
* conditionals support
* array iterator
* encoding
* control whitespace - strip or preserve
* streaming friendly
* use it as logic-less or with logic, it is up to you
* ! coffeescript block
* ! comment
* ! object iterator

[original doT playground](http://olado.github.com/doT)

## Differences

I created this fork for two reasons:

1. doT templates are hard as heck to debug.
2. No comment feature.

To get meaningful errors, set `dot.templateSettings`

    { append: false, strip: false }

## New Features

Comments

    {{-- This is a comment }}

CoffeeScript blocks

    {{`cs
        a = it?.prop || 'default'
    }}

Object iterator

    {{. it.fruits :value :key }}
        {{= key}} = {{= value}}
    {{.}}


## License
* doT is an open source component of http://bebedo.com
* doT is licensed under the MIT License. (See LICENSE-DOT)
