# lalu

Simple Javascript structures to implement UI applications.
(next version of pakkajs)

## Extend

extends multiple objects or classes into a single class.
It overlaps properties that are functions and overwrites otherwise.

## Model

Simple Model structure which is watchable.

Basic get, set, watch, trigger were implemented.
It uses lodash get and set so the underlying attributes can be a complex object.

## View

Simple View structure is implemented.
This extends Model, so this has all properties of Model.

View accepts HTML and CSS strings.

HTML is converted to DOM elements and bound to the view object via attibutes.

you can use attributes to bind view object to the DOM elements.