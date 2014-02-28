Viking.Model.reflectOnAssociations = function(macro) {
    var associations = _.values(this.associations);
    if (macro) {
        associations = _.select(associations, function(a) {
            return a.macro === macro;
        });
    }

    return associations;
}