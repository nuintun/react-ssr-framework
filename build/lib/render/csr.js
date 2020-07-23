import React from 'react';

// 是否首次初始化
let initialized = false;

/**
 * @function csr
 * @param {React.Component} Component
 * @param {() => React.Component} onLoading
 * @param {number} delay
 * @returns {React.Component}
 */
export default function csr(Component, onLoading = () => 'Loading...', delay = 150) {
  return class ClientRender extends React.Component {
    state = {
      loading: false,
      initialProps: {}
    };

    async componentDidMount() {
      const { props } = this;
      const { preload } = Component;

      // 使用 react-loadable 或者 loadable-components 加载组件
      if (preload) {
        const exports = await preload(props);

        Component = exports.default || exports;
      }

      // 读取 getInitialProps 方法
      const { getInitialProps } = Component;

      // 执行 getInitialProps 方法
      if (getInitialProps) {
        // 只有在首次进入页面需要将 window.__INITIAL_DATA__ 作为 props，路由切换时不需要
        if (!initialized) {
          initialized = true;

          this.setState({ initialProps: window.__INITIAL_DATA__ });
        } else {
          const defer = () => {
            this.setState({ loading: true });
          };

          const timer = setTimeout(defer, delay);
          const initialProps = await getInitialProps(props);

          clearTimeout(timer);

          this.setState({ loading: false, initialProps });
        }
      }
    }

    render() {
      const { loading, initialProps } = this.state;

      if (loading) return onLoading(Component, this.props);

      return <Component {...this.props} {...initialProps} />;
    }
  };
}
