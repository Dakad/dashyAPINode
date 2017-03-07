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

ESLINT		= $(DIR_BIN)/eslint
JSDOC		= $(DIR_BIN)/jsdoc
MOCHA		= $(DIR_BIN)/mocha --bail --colors --timeout $(TIMEOUT) --growl
_MOCHA		= $(DIR_BIN)/_mocha 
NODEMON		= $(DIR_BIN)/nodemon
ISTANBUL	= $(DIR_BIN)/istanbul


dev:
	@NODE_ENV=dev \
	$(NODEMON) $(DIR_SRC)/app.js


lint:
	@echo "#####  ESLint-ing $(DIR_SRC)" ;
	@$(ESLINT) --color $(DIR_SRC) \ 
	@echo "#####  ESLint : DONE";

test: lint
	@echo "#####  Mocha Testing : $(DIR_SRC) $(DIR_TEST)";
	@NODE_ENV=test $(MOCHA) -R $(REPORTER) $(ALL_TESTS);
	@echo "#####  Mocha Testing : DONE";

test-watch:
	@NODE_ENV=test $(MOCHA) \
		--reporter $(REPORTER) \
		--watch \
		$(ALL_TESTS) \

test-cover:lint
	rm -rf coverage;
	@NODE_ENV=test $(ISTANBUL) cover \
	$(_MOCHA) $(ALL_TESTS) -- -R spec


test-coveralls: test
	@echo "#####  TRAVIS_JOB_ID $(TRAVIS_JOB_ID)"
	@NODE_ENV=test $(ISTANBUL) cover  \
	$(_MOCHA) --report lcovonly -- -R spec && \
		cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js || true


test-docs:
	@test -d $(DIR_DOC)/doc || mkdir $(DIR_DOC)/doc
	@test -d $(DIR_DOC)/test || mkdir $(DIR_DOC)/test
	@NODE_ENV=test $(MOCHA) --reporter=doc  $(DIR_SRC)  \
		| cat $(DIR_DOC)/doc/head.html - $(DIR_DOC)/doc/tail.html \
		> $(DIR_DOC)/test/test.html

		
docs: test-cover
	@echo "#### JsDoc-ing folder: $(DIR_SRC)";
	@$(JSDOC) \
		-c .jsdocrc.json \
		-d $(DIR_DOC)/doc \
		-r \
		-t $(DOC_TEMPL) \
		-R README.md \
		--verbose \
		$(DIR_SRC) \


commit: test clean
	@echo "New commit !";\
	git add .;\
	git commit -m "$m" ; \

commit-push:
	git push origin master

setup:
	@$(shell find logs/ -name "*.log")
	@node  --harmony setup.js


build: test test-docs docs
	@echo "##### Deleting the logs folder .... ";
	@rm -rf $(DIR_LOG); \
	@NODE_ENV=prod node --harmony $(DIR_SRC)/app.js \

clean:
	@echo "##### Clear logs folder";
	@rm $(DIR_LOG)/* \



all: test 

.PHONY: setup test
