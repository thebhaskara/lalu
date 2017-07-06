describe('View', function() {

    var html = '<span bind-text="text"></span><div bind-html="html"></div>';

    describe('Scenario 1', function() {
        var a;
        it('should get instantiated', function() {
            a = new lalu.view();
            expect(a.id).to.be.a('string');
        });
        it('should append to DOM', function() {
            _.each(a.elements, function(ele) {
                document.body.appendChild(ele);
            });
        });
        it('should be watchable', function() {
            a.watch('prop1', function(prop1){
                expect(prop1).to.eql(a.attributes.prop1);
            });
            a.set('prop1', 'bhaskara')
        });
        it('should able to destroy', function() {
            a.destroy();
        });
    });

    describe('Scenario 2 with html', function() {
        var a;
        it('should get instantiated', function() {
            a = new lalu.view({
                html: html
            });
            expect(a.id).to.be.a('string');
        });
        it('should append to DOM', function() {
            _.each(a.elements, function(ele) {
                document.body.appendChild(ele);
            });
        });
        it('should work for bind-text', function() {
            var myText = 'my text'
            a.set('text', myText);
            expect(a.elements[0].innerText).to.eql(myText);
        });
        it('should able to destroy', function() {
            a.destroy();
        });
    });

    // var a, b;

    // describe('instantiation', function() {
    //     it('should get instantiated', function() {
    //         a = new lalu.view();
    //         expect(a.id).to.be.a('string');
    //     });
    //     it('should get instantiated with html', function() {
    //         b = new (lalu.extend({
    //             html: '<span bind-text="text"></span><div bind-html="html" ></div>'
    //         }, lalu.view));
    //         expect(a.id).to.be.a('string');
    //     });
    //     it('should append to DOM', function() {
    //         _.each(b.elements, function(ele) {
    //             document.body.appendChild(ele);
    //         });
    //     });
    // });

    // var val = 'a', val1;

    // describe('setting and geting', function() {

    //     it('should set text when text property is changed', function() {
    //         b.set('text', val);
    //         expect(b.elements[0].innerText).to.eql(val)
    //     });
    //     it('should set html when text property is changed', function() {
    //         val = '<button bind-text="text1" bind-click="something">hi there</button>'
    //         b.set('html', val);
    //         b.watch('something', function(){
    //             console.log('ahhh')
    //         });
    //         expect(b.elements[1].innerHTML).to.eql(val)
    //     });
    //     it('should set text1 which is inside the html', function() {
    //         val1 = 'something'
    //         b.set('text1', val1);
    //         // expect(b.elements[1].innerHTML).to.eql(val)
    //     });
    // });

});
