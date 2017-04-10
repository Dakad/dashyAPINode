#!/bin/bash

DIR_BIN		= ./node_modules/.bin

DIR_SRC		= ./src
DIR_TEST 	= ./test
DIR_DOC		= ./docs
DIR_LOG		= ./logs
ALL_TESTS 	= $(shell find $(DIR_TEST) $(DIR_SRC)  -type f -name "*.spec.js"  -not -path "*/node_modules*")

DOC_TEMPL 	= ./node_modules/ink-docstrap/template
REPORTER	= spec
TIMEOUT		= 10000
REDIS_PWD	= pwd
REDIS_DB_TEST = 7
REDIS_DB_PROD = 5

ESLINT		= $(DIR_BIN)/eslint --cache
JSDOC		= $(DIR_BIN)/jsdoc
MOCHA		= $(DIR_BIN)/mocha --bail --colors --timeout $(TIMEOUT) -R $(REPORTER) 
_MOCHA		= $(DIR_BIN)/_mocha 
NODEMON		= $(DIR_BIN)/nodemon
NYC			= $(DIR_BIN)/nyc --cache
REDIS_DB	= $(REDIS_DB_TEST)
REDIS_CLI	= redis-cli -a $(REDIS_PWD) -n $(REDIS_DB)
ISTANBUL	= $(DIR_BIN)/istanbul


dev:

	@echo "#####  Launch in PROD ENV";
	@echo "###  Resetting Redis cache ..." ;
	$(REDIS_CLI) FLUSHALL;
	@DEBUG=* \
	NODE_ENV=production \
	$(NODEMON) $(DIR_SRC)/app.js;
	@echo "##### Launch over" ;

lint:

	@echo "#####  ESLint-ing $(DIR_SRC)" ;
	@$(ESLINT) --color --fix $(DIR_SRC); 
	@echo "#####  ESLint : DONE";


test: lint

	$(eval REDIS_DB = $(REDIS_DB_TEST))
	@echo "#####  Mocha Testing : $(DIR_SRC) $(DIR_TEST)";
	@echo "###  Resetting Redis cache ..." ;
	$(eval REDIS_DB = $(REDIS_DB_TEST))
	$(REDIS_CLI) FLUSHALL;

	@NODE_ENV=test $(MOCHA) $(ALL_TESTS);
	@echo "#####  Mocha Testing : DONE";

test-watch:

	@NODE_ENV=test $(MOCHA) --watch $(ALL_TESTS);


test-cover: lint

	$(eval REDIS_DB = $(REDIS_DB_TEST))
	@echo "#####  NYC Test Covering : $(DIR_SRC) $(DIR_TEST)";
	@echo "###  Resetting Redis cache ..." ;
	@$(REDIS_CLI) FLUSHALL > /dev/null;

	@NODE_ENV=test $(NYC) report \
		--reporter=lcov \
		--reporter-dir=$(DIR_DOC)/coverage \
		$(_MOCHA) $(ALL_TESTS);

	@open ./docs/coverage/lcov-report/*.html
	@echo "#####  NYC Test Covering ... : DONE" ;

test-docs:

	#@test -d $(DIR_DOC) || mkdir $(DIR_DOC);
	#@test -d $(DIR_DOC)/test || mkdir $(DIR_DOC)/test;
	@NODE_ENV=test $(_MOCHA) $(ALL_TESTS)\
			--reporter mochawesome \
			--reporter-options 	\
				reportDir=$(DIR_DOC)/test,reportFilename=reports,autoOpen=true;
	@NODE_ENV=test $(MOCHA) --reporter markdown  $(ALL_TESTS)  \
			> $(DIR_DOC)/test/reports.md

docs: clean test-cover test-docs

	@echo "#### JsDoc-ing folder: $(DIR_SRC)";
	@$(JSDOC) \
		-c .jsdocrc.json \
		-d $(DIR_DOC)/doc \
		-r \
		-R README.md \
		-t $(DOC_TEMPL) \
		--verbose \
		$(DIR_SRC) ;

	@open $(DIR_DOC)/doc/index.html


setup:

	@$(find ./logs -name "*.log")
	@node --harmony setup.js


build: test docs

	@echo "##### Clear the logs folder .... ";
	@rm -rf $(DIR_LOG)/*;
	@NODE_ENV=production node --harmony $(DIR_SRC)/app.js;

clean:

	@echo "##### Clear NYC folder";
	@rm -rf .nyc_output/*;
	@echo "##### Clear logs folder";
	@rm -rf $(DIR_LOG)/*;
	@echo "##### Clear doc folder";
	@rm -rf $(DIR_DOC)/*;
	@echo "#####  Resetting Redis PROD cache ..." ;
	@$(REDIS_CLI) FLUSHALL;
	@echo "#####  Resetting Redis TEST cache ..." ;
	@$(eval REDIS_DB = $(REDIS_DB_TEST))
	@$(REDIS_CLI) FLUSHALL;

	@echo "##### Cleanig DONE";



all: test 

.PHONY: docs setup test build dev
