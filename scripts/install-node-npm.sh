echo 'export PATH=$HOME/local/bin:$PATH' >> ~/.bashrc
. ~/.bashrc
mkdir ~/local
mkdir ~/node-v7.10
cd ~/node-v7.10
curl http://nodejs.org/dist/v7.10.0/node-v7.10.0.tar.gz | tar xz --strip-components=1
./configure --prefix=~/local
make install
bash ./npm_install.sh | sh
