// require fileSystem

var fs = require('fs')

/**
* prepareViewObject checks the files in the view {} Object
* @param view {} Object contains the (header, include, footer) files
*/

var prepareViewObject = (view) => {

    // console.log('inside prepareViewObject')

    return new Promise((fulfill, reject) => {

        // set the files Object and the arrays

        view.files = {}
        view.files.headers = []
        view.files.filesToInclude = []
        view.files.footers = []
        view.files.mainFiles = {}

        view.view = view.view ? view.view : 'Index'
        view.headers = view.headers ? view.headers : []
        view.filesToInclude = view.filesToInclude ? view.filesToInclude : []
        view.footers = view.footers ? view.footers : []
        view.json = view.json != undefined ? view.json : true
        view.mainjson = view.mainjson != undefined ? view.mainjson : true

        fulfill(view) // go to prepareViewObject.then()
    })
}

/**
* prepareViewFiles sets the view Files
* @param view {} Object contains the (header, include, footer) files
*/

var prepareViewFiles = (view) => {

    return new Promise((fulfill, reject) => {

        // console.log('inside prepareViewFiles')

        // getHeaders returns a Promise

        var getHeaders = () => {

            return new Promise((fulfill, reject) => {

                // console.log('inside getHeaders')

                // setFiles

                setFiles('headers', view.headers)
                .then((array) => {

                    // set the files array
                    // console.log('inside setFiles (then); getHeaders')

                    view.files.headers = array

                    fulfill() // Promise.all() next element

                }).catch((err) => {

                    // console.log('inside setFiles (catch); getHeaders')
                    console.log(err)
                })
            })
        }

        // getFilesToInclude returns a Promise

        var getFilesToInclude = () => {

            return new Promise((fulfill, reject) => {

                // console.log('inside getFilesToInclude')

                // setFiles

                setFiles('filesToInclude', view.filesToInclude)
                .then((array) => {

                    // set the files array
                    // console.log('inside setFiles (then); getFilesToInclude')

                    view.files.filesToInclude = array

                    fulfill() // Promise.all() next element

                }).catch((err) => {

                    // console.log('inside setFiles (catch); getFilesToInclude')
                    console.log(err)
                })
            })
        }

        var getFooters = () => {

            return new Promise((fulfill, reject) => {

                // console.log('inside getFooters')

                // setFiles

                setFiles('footers', view.footers)
                .then((array) => {

                    // console.log('inside setFiles (then); getFooters')

                    view.files.footers = array

                    fulfill() // go to Promise.all next element

                }).catch((err) => {

                    // console.log('inside setFiles (catch); getFooters')
                    console.log(err)
                })
            })
        }

        var mainFilesOrNot = () => {

            return new Promise((fulfill, reject) => {

                getFile('./Views/' + view.view + '/head.ejs').then((headFile) => {

                    // console.log('inside mainFilesorNot getFile (1)')

                    view.files.mainFiles.head = headFile

                    getFile('./Views/' + view.view + '/foot.ejs').then((footFile) => {

                        // console.log('inside mainFilesorNot getFile (2)')

                        view.files.mainFiles.foot = footFile

                        // setting up mainJSON {} Object

                        if(view.mainjson) {
                            view.mainjson = JSON.parse(fs.readFileSync('./Views/includes/main/main.json'))
                        }

                        // setting up json {} Object

                        if(view.json) {
                            getFile('./Views/' + view.view + '/' + view.view + '.json').then((jsonFile) => {

                                // console.log('inside mainFilesorNot getFile (3)')

                                if(jsonFile != '---') {
                                    view.json = JSON.parse(fs.readFileSync('./Views/' + view.view + '/' + view.view + '.json'))
                                    fulfill()
                                }
                                else {
                                    fulfill()
                                }
                            })
                        }
                        else {
                            fulfill()
                        }
                    })
                })

            })
        }

        // Promise.all runs all the Promises

        Promise.all([getHeaders(), getFilesToInclude(), getFooters(), mainFilesOrNot()])
        .then(() => {

            // console.log('inside Promise.all (then) in prepareViewFiles')
            fulfill(view)

        }).catch((err) => {

            // console.log('inside Promise.all (catch) in prepareViewFiles')
            reject(err)
        })
    })
}

/**
* setFiles function returns a Promise for the include promises
* @param from determines the folder of the file
* @param files array with the filenames
*/

var setFiles = (from, files) => {

    return new Promise((fulfill, reject) => {

        // console.log('inside setFiles)

        /**
        * @param array [] for the existing files
        */

        var array = []

        var getFiles = new Promise((fulfill, reject) => {

            // console.log('inside getFiles')

            /**
            * @param pA [] for the Promises
            */

            var pA = []

            // push the Promises to pA[] array

            files.forEach((file) => {
                let filePath = './Views/includes/' + from + '/' + file + '.ejs'
                pA.push(getFile(filePath))
            })

            // Promises.all(pA) runs all the Promises in pA array

            Promise.all(pA)
            .then((array) => {

                // console.log('inside Promise.all (then) in setFiles')

                fulfill(array) // go to getFiles.then()
            })
            .catch((err) => {

                // console.log('inside Promise.all (catch) in setFiles')

                reject(err)
            })
        })

        getFiles
        .then((array) => {

            // console.log('inside getFiles (then) in setFiles')

            fulfill(array)
        })
        .catch((err) => {

            // console.log('inside getFiles (catch) in setFiles')

            reject(err)
        })
    })
}

/**
* getFile function returns a Promise for the setFiles -> pA[] array
* @param filePath from the setFiles -> Promise -> forEach()
*/

var getFile = (filePath) => {

    return new Promise((fulfill, reject) => {

        // check if the file exists; if not resolve with '---' -> handled by the prebuilder.ejs
        // console.log('inside getFile)

        fs.access(filePath, function(err) {
            err && err.code === 'ENOENT' ? fulfill("---") : fulfill(filePath.substr(8, filePath.lenght))
        });
    })
}

module.exports = () => {

    var model = {}

    /**
    * PreRender function; calls res.Render with options
    * @param options from Controller -> preRender.render(options)
    */

    model.render = (options) => {

        // check options.view object
        // console.log('render start...)

        prepareViewObject(options.view).then((view) => {

            // check (options.view.headers && options.view.filesToInclude && options.view.footers) files
            // console.log('prepareViewObject end')

            prepareViewFiles(view).then((view) => {

                // res.Render
                // console.log('prepareViewFiles end')
                // console.log(view)

                options.res.render('./prebuilder.ejs', {view: view, data: options.data})

                // console.log('render end...)

            }).catch((err) => {
                console.log(err)
            })
        })
    }

    return model
}
