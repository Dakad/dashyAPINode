#!/bin/bash

DIR_BIN		= ./node_modules/.bin

DIR_SRC		= ./src
DIR_TEST 	= ./test
DIR_DOC		= ./docs
DIR_LOG		= ./logs
ALL_TESTS 	= $(shell find $(DIR_TEST) $(DIR_SRC)  -type f -name "*.spec.js"  -not -path "*node_modules*")

DOC_TEMPL 	= ./node_modules/ink-docstrap/template
REPORTER	= spec
TIMEOUT		= 5000

ESLINT		= $(DIR_BIN)/eslint --cache
JSDOC		= $(DIR_BIN)/jsdoc
MOCHA		= $(DIR_BIN)/mocha --bail --colors --timeout $(TIMEOUT) -R $(REPORTER) 
_MOCHA		= $(DIR_BIN)/_mocha 
NODEMON		= $(DIR_BIN)/nodemon
NYC			= $(DIR_BIN)/nyc --cache
ISTANBUL	= $(DIR_BIN)/istanbul


dev:
	@NODE_ENV=dev \
	$(NODEMON) $(DIR_SRC)/app.js


lint:
	@echo "#####  ESLint-ing $(DIR_SRC)" ;
	@$(ESLINT) --color $(DIR_SRC) --fix; 
	@echo "#####  ESLint : DONE";



test: lint
	@echo "#####  Mocha Testing : $(DIR_SRC) $(DIR_TEST)";
	@NODE_ENV=test $(MOCHA) $(ALL_TESTS);
	@echo "#####  Mocha Testing : DONE";

test-watch:
	@NODE_ENV=test $(MOCHA) --watch $(ALL_TESTS);


test-cover: lint
	@NODE_ENV=test $(NYC) report --reporter=lcov $(_MOCHA) $(ALL_TESTS)


test-docs:
	export NODE_ENV="test";
	@test -d $(DIR_DOC) || mkdir $(DIR_DOC)
	@test -d $(DIR_DOC)/test || mkdir $(DIR_DOC)/test;
	@NODE_ENV=test $(MOCHA) --reporter mochawesome $(ALL_TEST);
	@NODE_ENV=test $(MOCHA) --reporter markdown  $(ALL_TEST)  \
			> $(DIR_DOC)/test/index.md

docs: clean test-cover
	@echo "#### JsDoc-ing folder: $(DIR_SRC)";
	@$(JSDOC) \
		-c .jsdocrc.json \
		-d $(DIR_DOC)/doc \
		-r \
		-t $(DOC_TEMPL) \
		-R README.md \
		--verbose \
		$(DIR_SRC) ;
	@open $(DIR_DOC)/doc/index.html

commit: test clean
	@echo "New commit !";\
	git add .;\
	git commit -m "$m" ; \

commit-push:
	git push origin master

setup:
	@$(find ./logs -name "*.log")
	@node --harmony setup.js


build: test test-docs docs
	@echo "##### Deleting the logs folder .... ";
	@rm -rf $(DIR_LOG); \
	@NODE_ENV=prod node --harmony $(DIR_SRC)/app.js \

clean:
	@echo "##### Clear logs folder";
	@rm -rf $(DIR_LOG)/* \
	@echo "##### Clear doc folder";
	@rm -rf $(DIR_DOC)/* ;
	@echo "##### Cleanig DONE";



all: test 

.PHONY: docs setup test build dev
