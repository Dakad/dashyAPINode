echo 'export PATH=$HOME/local/bin:$PATH' >> ~/.bashrc
. ~/.bashrc
mkdir ~/local
mkdir ~/node-v7.8
cd ~/node-v7.8
curl http://nodejs.org/dist/v7.8.0/node-v7.8.0.tar.gz | tar xz --strip-components=1
./configure --prefix=~/local
make install
curl http://npmjs.org/install.sh | sh
