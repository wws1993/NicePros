const path = require('path');
const webpack = require('webpack');
const glob = require('glob');
const WebpackDevServer = require('webpack-dev-server');
//清除插件
const CleanWebpackPlugin = require('clean-webpack-plugin');
const isPro = process.env.NODE_ENV === 'production';
/*
extract-text-webpack-plugin插件，
有了它就可以将你的样式提取到单独的css文件里
 */
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');//自动打开浏览器
const entries = getEntry('src/js/page/*.js', 'src/js/page');
const commonsChunk = getCommonsChunk('src/js/page/*.js', 'src/js/page');
const config = {
  entry: entries,
  output: {
    path: path.join(__dirname, './dist'), //输出目录的配置，模板、样式、脚本、图片等资源的路径配置都相对于它
    // publicPath: '/',              //模板、样式、脚本、图片等资源对应的server上的路径
    filename: 'js/[name].js',           //每个页面对应的主js的生成配置 #-[hash:6] 去掉hash配置 服务端通过url ? 来缓存
    chunkFilename: 'js/[id].chunk.js'   //chunk生成的配置
  },
  module: {
    rules: [ //加载器，关于各个加载器的参数配置，可自行搜索之。
      {
        test: /\.js$/, loader: 'babel-loader',
        exclude: path.resolve(__dirname, "./node_modules"),
        include: path.resolve(__dirname, "./src"),
        options: { 'presets': ['es2015'] }
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({ fallback: 'style-loader', publicPath: './',
          use: [
            { loader: 'css-loader', options: { minimize: true } },
            {loader: 'postcss-loader', options:{plugins:[require("autoprefixer")("last 100 versions")]}}
          ]
        })
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({ fallback: "style-loader", publicPath: '../',
          use: [
            { loader: "css-loader", options: { minimize: true, sourceMap: true } },
            { loader: "less-loader", options: { outputStyle: 'compressed', sourceMap: true }}
          ]
        })
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({ fallback: "style-loader", publicPath: '../',
          use: [
            {loader: "css-loader", options: { minimize: true, sourceMap: true }},
            {loader: 'postcss-loader', options:{plugins:[require("autoprefixer")("last 100 versions")]}},
            {loader: "sass-loader", options: { outputStyle: 'compressed', sourceMap: true }}
          ]
        })
      },
      { test: /\.(html|tpl)$/, use: ['html-loader'] },
      {
        test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: { loader: 'file-loader', options: { name: 'fonts/[path][name].[ext]' } }
      },
      {
        test: /\.(mp4|flv|swf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: { loader: 'file-loader', options: { name: 'resource/[path][name].[ext]' }}
      },
      {
				test: /\.(png|jpg|gif)$/,
				use: ['url-loader?limit=8192&name=img/[name].[ext]'] //.[hash:6]
      },
      {
				test: /\.(eot|woff|ttf)$/,
				use: ['url-loader?limit=8192&name=font/[name].[hash:16].[ext]']
			}
    ]
  },
  devtool: 'inline-source-map',
  //webpack-dev-server 服务配置
  devServer: {
    historyApiFallback: true,
    contentBase: './dist',
    host: 'localhost',
    port: 8090,
    inline: true,
    // proxy: {
    //   '/api/*': {
    //     target: 'http://xxx.com.cn',
    //     changeOrigin: true,
    //     secure: false
    //   }
    // }
  },
  plugins: [
    // new webpack.ProvidePlugin({ //加载jq
    //   $: 'jquery',
    //   jQuery: "jquery",
    //   "window.jQuery": "jquery"
    // }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common', // 将公共模块提取，生成名为`vendors`的chunk
      chunks: commonsChunk, //提取哪些模块共有的部分
      minChunks: commonsChunk.length // 提取至少3个模块共有的部分
    }),
    // // js压缩 ----- 生产环境打开  开发环境打开速率慢
    // new webpack.optimize.UglifyJsPlugin({
    //   beautify: false,
    //   comments: false,
    //   compress: {
    //     warnings: false,
    //     drop_console: true
    //   }
    // }),
    new ExtractTextPlugin('css/[name].css'), //单独使用link标签加载css并设置路径，相对于output配置中的publickPath #-[hash:6] css去掉hash 缓存 服务端 url ? 来判断
    //HtmlWebpackPlugin，模板生成相关的配置，每个对于一个页面的配置，有几个写几个
    new OpenBrowserPlugin({                 //编译完成后自动打开浏览器
      url: 'http://localhost:9090'
    }),
    new webpack.HotModuleReplacementPlugin(), //热加载
    new CleanWebpackPlugin(
      ['dist/*'],　 //匹配删除的文件
      {
        root: __dirname,       　　　　　　　　　　//根目录
        verbose:  false,        　　　　　　　　　　//开启在控制台输出信息
        dry:      false        　　　　　　　　　　//启用删除文件
      }
    )
  ]
};

var viesObj = getView('src/*.html', 'src/');
var pages = Object.keys(viesObj);
pages.forEach(function (pathname) {
  var htmlName = viesObj[pathname]
  var conf = {
    filename: htmlName + '.html', //生成的html存放路径，相对于path
    template: './src/' + htmlName + '.html', //html模板路径
    inject: 'body', //js插入的位置，true/'head'/'body'/false
    //favicon: './src/img/favicon.ico', //favicon路径，通过webpack引入同时可以生成hash值
    chunks: ['common', htmlName],//需要引入的chunk，不配置就会引入所有页面的资源
    minify: { //压缩HTML文件
      removeComments: true, //移除HTML中的注释
      collapseWhitespace: false //删除空白符与换行符
    }
  };
  config.plugins.push(new HtmlWebpackPlugin(conf));
});


module.exports = config;

function getView (globPath, pathDir) {
  var files = glob.sync(globPath);
  var entries = {},
    entry, dirname, basename, pathname, extname;

  for (var i = 0; i < files.length; i++) {
    entry = files[i];
    dirname = path.dirname(entry);

    extname = path.extname(entry);
    basename = path.basename(entry, extname);
    pathname = path.join(dirname, basename);
    pathname = pathDir ? pathname.replace(new RegExp('^' + pathDir), '') : pathname;
    entries[pathname] = basename;
  }
  return entries;
}


function getEntry (globPath, pathDir) {
  var files = glob.sync(globPath);
  var entries = {},
    entry, dirname, basename, pathname, extname;

  for (var i = 0; i < files.length; i++) {
    entry = files[i];
    dirname = path.dirname(entry);
    extname = path.extname(entry);
    basename = path.basename(entry, extname);
    pathname = path.join(dirname, basename);
    entries[basename] = './' + entry;
  }
  return entries;
}

function getCommonsChunk (globPath, pathDir) {
  var files = glob.sync(globPath);
  var entries = [],
    entry, dirname, basename, extname;

  for (var i = 0; i < files.length; i++) {
    entry = files[i];
    dirname = path.dirname(entry);
    extname = path.extname(entry);
    basename = path.basename(entry, extname);
    entries.push(basename);
  }
  return entries;
}
