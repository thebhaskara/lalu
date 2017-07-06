describe('Model', function() {

    var a;

    describe('instantiation', function() {
        it('should get instantiated', function() {
            a = new lalu.model();
            expect(a.id).to.be.a('string');
        });
    });

    var val = 'a';

    describe('setting and geting', function() {

        it('should set a simple property', function() {
            a.set('a', val);
            expect(a.attributes.a).to.eql(val)
        });

        it('should get a simple property', function() {
            expect(a.get('a')).to.eql(val);
        });

        it('should set a complex path', function() {
            a.set('b.c.d', val);
            expect(a.attributes.b.c.d).to.eql(val)
        });

        it('should get a complex path', function() {
            expect(a.get('b.c.d')).to.eql(val);
        });
    });

    describe('watching properties', function() {
        var watchId;
        var watchId1;
        it('should trigger the watch callback', function() {
            watchId = a.watch('d', function(d) {
                expect(d).to.eql(a.attributes.d);
            });
            a.set('d', 10);
        });

        it('should trigger watch callback on complex path', function() {
            watchId1 = a.watch('a.b.c', function(c) {
                expect(c).to.eql(a.attributes.a && a.attributes.a.b && a.attributes.a.b.c);
            });
            a.set('a.b.c', 20);
        });

        it('should trigger watch callback when parent property is changed', function() {
            a.set('a.b', { c: { d: 11 } });
        });

        it('should trigger watch callback when grand parent property is changed', function() {
            a.set('a', { b: { c: { d: 11 } } });
        });

        it('should trigger watch callback when child property is changed', function() {
            a.set('a.b.c.d', 22);
        });

        it('should trigger watch callback when grand child property is changed', function() {
            a.set('a.b.c.d.e', 24);
        });

        it('should change the structure back to single level', function() {
            a.set('a', 29);
        });

        it('should be unwatchable', function(){
            a.unwatch(watchId);
            a.unwatch(watchId1);
        })

        it('should attach watch to any change', function() {
            a.watch(function(attr){
                expect(attr).to.eql(a.attributes);
            });
            a.set('a', 10);
        });

        it('should attach watch to any deeper change', function() {
            a.set('a.b', 11);
        });
    })
});
